from boto3.dynamodb.conditions import Key
from decimal import Decimal
from utils.keys import pk_plot
from schemas.plot import PlotState, SensorData
from dal.database import table

def create_plot(plot_id: str, user_id: str, state: PlotState) -> dict:
    item = {
        "pk": pk_plot(plot_id),
        "sk": "METADATA",
        "user_id": user_id,
        "state": PlotState(state).value # Solo se permiten los valores definidos en el enum
    }
    table.put_item(Item=item)
    return item

def get_plot(plot_id: str) -> dict | None:
    response = table.get_item(
        Key={
            "pk": pk_plot(plot_id),
            "sk": "METADATA"
        }
    )
    return response.get("Item")

def add_sensor_data(plot_id: str, sensor_id: str, timestamp: str, data: SensorData) -> dict:
    item = {
        "pk": pk_plot(plot_id),
        "sk": f"SENSOR_DATA#{sensor_id}#{timestamp}",
        "temperature": Decimal(str(data.temperature)),
        "humidity": Decimal(str(data.humidity)),
        "soil_moisture": Decimal(str(data.soil_moisture)),
        "light": Decimal(str(data.light)),
    }
    table.put_item(Item=item)
    return item

def get_plot_sensor_data(plot_id: str, sensor_id: str) -> dict | None: # dame todos los datos de un sensor en un plot
    response = table.query(
        KeyConditionExpression=Key("pk").eq(pk_plot(plot_id)) & Key("sk").begins_with(f"SENSOR_DATA#{sensor_id}#")
    )
    return response.get("Items")

def update_plot_state(plot_id: str, new_state: PlotState) -> None:
    table.update_item(
        Key={
            "pk": pk_plot(plot_id),
            "sk": "METADATA"
        },
        UpdateExpression="SET state = :state",
        ExpressionAttributeValues={
            ":state": PlotState(new_state).value
        }
    )

def delete_plot(plot_id: str) -> None:
    response = table.query(
        KeyConditionExpression=Key("pk").eq(pk_plot(plot_id))
    )
    items = response.get("Items", [])
    
    for item in items:
        table.delete_item(
            Key={
                "pk": item["pk"],
                "sk": item["sk"]
            }
        )   

