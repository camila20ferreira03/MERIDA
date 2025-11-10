import logging
import os
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Sequence, Tuple

import boto3
from boto3.dynamodb.types import TypeDeserializer
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

deserializer = TypeDeserializer()

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["DYNAMO_TABLE_NAME"])

sns_client = boto3.client("sns")

ALERTS_TOPIC_ARN = os.environ.get("ALERTS_TOPIC_ARN")

METRIC_TO_RANGE_FIELDS: Dict[str, Sequence[str]] = {
    "temperature": ("MinTemperature", "MaxTemperature"),
    "humidity": ("MinHumidity", "MaxHumidity"),
    "light": ("MinLight", "MaxLight"),
    "irrigation": ("MinIrrigation", "MaxIrrigation"),
}


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    DynamoDB Streams handler that evaluates sensor readings against ideal values.
    Publishes SNS alerts to notify Cognito users when measurements are out of range.
    """
    records = event.get("Records", [])
    logger.info("Received %d DynamoDB stream records", len(records))

    processed = 0
    for record in records:
        if record.get("eventName") != "INSERT":
            continue

        new_image = record.get("dynamodb", {}).get("NewImage")
        if not new_image:
            logger.debug("Record without NewImage, skipping")
            continue

        try:
            item = _deserialize_item(new_image)
            if _process_plot_state(item):
                processed += 1
        except Exception as exc:  # pylint: disable=broad-except
            logger.exception("Failed to process record: %s", exc)

    return {"statusCode": 200, "processed_records": processed}


def _deserialize_item(image: Dict[str, Any]) -> Dict[str, Any]:
    """Convert DynamoDB Streams image into standard Python dict."""
    return {key: deserializer.deserialize(value) for key, value in image.items()}


def _process_plot_state(item: Dict[str, Any]) -> bool:
    """
    Process a single plot state record.
    Returns True if the record triggered an alert evaluation (normal or alert).
    """
    pk = item.get("PK")
    sk = item.get("SK")

    if not pk or not sk or not pk.startswith("PLOT#") or not sk.startswith("STATE#"):
        logger.debug("Item %s/%s is not a plot state event, skipping", pk, sk)
        return False

    plot_id = pk.split("#", maxsplit=1)[-1]
    timestamp = item.get("Timestamp") or sk.split("#", maxsplit=1)[-1]
    species_id = item.get("SpeciesId") or item.get("species_id")
    facility_id = item.get("FacilityId") or item.get("facility_id")
    business_id = item.get("BusinessId") or item.get("business_id")

    if not species_id:
        logger.info("State %s missing SpeciesId, skipping alert evaluation", sk)
        return True

    if not facility_id and isinstance(item.get("GSI_PK"), str) and item["GSI_PK"].startswith("FACILITY#"):
        facility_id = item["GSI_PK"].split("#", maxsplit=1)[-1]

    ideal = _fetch_ideal_species_record(facility_id, species_id)
    if not ideal:
        logger.warning(
            "Ideal parameters not found for species %s (facility=%s)", species_id, facility_id
        )
        return True

    business_id = business_id or ideal.get("BusinessId") or ideal.get("business_id")

    deviations = _find_deviations(item, ideal)
    if not deviations:
        logger.info("Plot %s measurements at %s are within acceptable range", plot_id, timestamp)
        return True

    recipients = _fetch_responsible_emails(business_id, facility_id)
    if not recipients:
        logger.warning("No responsible emails found for facility %s (business=%s); skipping SNS notification", facility_id, business_id)
        return True

    _publish_alert(
        plot_id=plot_id,
        species_id=species_id,
        facility_id=facility_id,
        timestamp=timestamp,
        deviations=deviations,
        recipients=recipients,
    )
    return True


def _fetch_ideal_species_record(facility_id: Any, species_id: Any) -> Dict[str, Any]:
    """Retrieve ideal parameters for the specified species."""
    facility_segment = f"FACILITY#{facility_id}" if facility_id else None

    candidates: List[Dict[str, Any]] = []
    keys_to_try: List[Tuple[str, str]] = []

    if facility_segment:
        keys_to_try.append((facility_segment, f"SPECIES#{species_id}"))
    keys_to_try.append((f"SPECIES#{species_id}", "PROFILE"))

    for pk, sk in keys_to_try:
        try:
            response = table.get_item(Key={"PK": pk, "SK": sk})
        except ClientError as error:  # pragma: no cover - log AWS errors
            logger.error("Failed to fetch ideal parameters: %s", error)
            continue

        item = response.get("Item")
        if item:
            candidates.append(item)

    return candidates[0] if candidates else {}


def _find_deviations(
    measurement: Dict[str, Any],
    ideal_ranges: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """Compare measurement against configured ranges and return deviation details."""
    deviations: List[Dict[str, Any]] = []

    for metric, range_fields in METRIC_TO_RANGE_FIELDS.items():
        if metric not in measurement:
            continue

        lower_field, upper_field = range_fields
        lower_bound = _to_float(_first_present(ideal_ranges, (lower_field, lower_field.lower())))
        upper_bound = _to_float(_first_present(ideal_ranges, (upper_field, upper_field.lower())))
        actual_value = _to_float(measurement[metric])

        if actual_value is None:
            continue

        if lower_bound is not None and actual_value < lower_bound:
            deviations.append(
                {
                    "metric": metric,
                    "actual": actual_value,
                    "lower_bound": lower_bound,
                    "upper_bound": upper_bound,
                    "direction": "below",
                }
            )
            continue

        if upper_bound is not None and actual_value > upper_bound:
            deviations.append(
                {
                    "metric": metric,
                    "actual": actual_value,
                    "lower_bound": lower_bound,
                    "upper_bound": upper_bound,
                    "direction": "above",
                }
            )

    return deviations


def _fetch_responsible_emails(business_id: Any, facility_id: Any) -> List[str]:
    """Retrieve responsible emails from the Business → Facility mapping in DynamoDB."""
    if not business_id or not facility_id:
        logger.warning("Missing business_id (%s) or facility_id (%s) for responsible lookup", business_id, facility_id)
        return []

    key = {
        "PK": f"BUSINESS#{business_id}",
        "SK": f"FACILITY#{facility_id}",
    }

    try:
        response = table.get_item(Key=key)
    except ClientError as error:  # pragma: no cover - AWS errors logged
        logger.error("Failed to fetch responsibles for %s: %s", key, error)
        return []

    record = response.get("Item")
    if not record:
        logger.info("No responsible record found for business %s / facility %s", business_id, facility_id)
        return []

    # Accept multiple possible attribute names to stay compatible with existing data
    raw_emails = (
        record.get("responsibles")
        or record.get("Responsibles")
        or record.get("Users")
        or record.get("users")
    )

    if isinstance(raw_emails, list):
        return [email for email in raw_emails if isinstance(email, str) and email.strip()]

    if isinstance(raw_emails, str):
        return [email.strip() for email in raw_emails.split(",") if email.strip()]

    logger.info("Responsible record for business %s / facility %s does not contain emails", business_id, facility_id)
    return []


def _publish_alert(
    plot_id: str,
    species_id: Any,
    facility_id: Any,
    timestamp: Any,
    deviations: List[Dict[str, Any]],
    recipients: List[str],
) -> None:
    """Publish alert message to SNS topic."""
    if not ALERTS_TOPIC_ARN:
        logger.error("ALERTS_TOPIC_ARN environment variable is required to publish alerts")
        return

    subject = f"[SmartGrow] Plot {plot_id} out of range"

    lines = [
        f"Plot ID: {plot_id}",
        f"Species: {species_id}",
        f"Facility: {facility_id or 'Unknown'}",
        f"Timestamp: {timestamp or datetime.utcnow().isoformat()}",
        "",
        "Metrics outside tolerance:",
    ]

    for deviation in deviations:
        lines.append(
            (
                f"- {deviation['metric'].capitalize()}: actual={deviation['actual']:.2f}, "
                f"allowed range "
                f"{'' if deviation.get('lower_bound') is None else '>=' + format(deviation['lower_bound'], '.2f') + ' '}"
                f"{'' if deviation.get('upper_bound') is None else '<= ' + format(deviation['upper_bound'], '.2f')}"
            )
        )

    lines.extend(
        [
            "",
            "Recipients:",
            ", ".join(recipients),
        ]
    )

    message = "\n".join(lines)

    try:
        sns_client.publish(
            TopicArn=ALERTS_TOPIC_ARN,
            Subject=subject,
            Message=message,
        )
        logger.info("Alert published for plot %s", plot_id)
    except ClientError as error:  # pragma: no cover
        logger.error("Failed to publish alert: %s", error)


def _to_float(value: Any) -> float:
    """Convert DynamoDB numeric types to float for calculations."""
    if value is None:
        return None

    if isinstance(value, Decimal):
        return float(value)

    if isinstance(value, (int, float)):
        return float(value)

    try:
        return float(value)
    except (TypeError, ValueError):
        logger.debug("Unable to convert value %s (%s) to float", value, type(value))
        return None


def _first_present(source: Dict[str, Any], keys: Sequence[str]) -> Any:
    """Return the first non-null value for the provided key aliases."""
    for key in keys:
        if key in source and source[key] not in (None, ""):
            return source[key]
    return None

