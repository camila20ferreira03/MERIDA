from fastapi import APIRouter, Depends, HTTPException
from botocore.exceptions import ClientError
import json
from boto3.dynamodb.conditions import Key, Attr
from src.schemas.facilities import FacilityCreate, FacilityUpdate
from src.dal.database import table
from uuid import uuid4
"""
🏢 Instalaciones
GET /facilities
GET /facilities/{facility_id}
POST /facilities
PUT /facilities/{facility_id}
DELETE /facilities/{facility_id}
"""

router = APIRouter(prefix="/facilities", tags=["Instalaciones"])

@router.get("/", description="Obtener todas las instalaciones")
async def get_facilities():
    try:
        response = table.query(
            IndexName="GSI_TypeIndex",
            KeyConditionExpression=Key("type").eq("FACILITY")
        )

        facilities = response.get("Items", [])

        # Manejo de paginación si hay más resultados
        while "LastEvaluatedKey" in response:
            response = table.query(
                IndexName="GSI_TypeIndex",
                KeyConditionExpression=Key("type").eq("FACILITY"),
                ProjectionExpression="#pk, #sk, #n, #l",
                ExpressionAttributeNames={
                    "#pk": "pk",
                    "#sk": "sk",
                    "#n": "name",
                    "#l": "location"
                }
            )
            facilities.extend(response.get("Items", []))

        return {"count": len(facilities), "facilities": facilities}

    except ClientError as e:
        msg = e.response.get("Error", {}).get("Message", str(e))
        raise HTTPException(status_code=500, detail=f"Error consulting DynamoDB: {msg}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/", description="Crear una nueva instalación")
async def create_facility(facility: FacilityCreate):
    try:
        facility_id = str(uuid4())

        item = {
            "pk": f"FACILITY#{facility_id}",
            "sk": "Metadata",
            "facility_id": facility_id,
            "name": facility.name,
            "location": facility.location,
            "type": "FACILITY"
        }

        table.put_item(Item=item)

        return {
            "message": "Facility created successfully",
            "facility": item
        } 

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error creating facility: {e}")
    

@router.get("/{facility_id}", description="Obtener detalles de una instalación")
async def get_facility(facility_id: str):
    response = table.get_item(
        Key={
            "pk": f"FACILITY#{facility_id}",
            "sk": "Metadata"
        }
    )

    if "Item" not in response:
        raise HTTPException(status_code=404, detail="Facility not found")
    
    return response.get("Item")

@router.put("/{facility_id}", description="Actualizar una instalación")
async def update_facility(facility_id: str, facility: FacilityUpdate):
    try:
        response = table.get_item(
            Key={"pk": f"FACILITY#{facility_id}", "sk": "Metadata"}
        )

        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Facility not found")

        update_data = facility.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        expression_attribute_names = {}
        expression_attribute_values = {}
        update_expressions = []

        for i, (key, value) in enumerate(update_data.items(), start=1):
            # Evitar palabras reservadas usando alias con "#attrX"
            attr_name_alias = f"#attr{i}"
            attr_value_alias = f":val{i}"

            expression_attribute_names[attr_name_alias] = key
            expression_attribute_values[attr_value_alias] = value
            update_expressions.append(f"{attr_name_alias} = {attr_value_alias}")

        update_expression = "SET " + ", ".join(update_expressions)

        result = table.update_item(
            Key={"pk": f"FACILITY#{facility_id}", "sk": "Metadata"},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"  # Devuelve el ítem actualizado
        )

        return {
            "message": "Facility updated successfully",
            "updated_facility": result.get("Attributes", {})
        }

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error updating facility: {e}")



@router.delete("/{facility_id}", description="Eliminar una instalación")
async def delete_facility(facility_id: str):
    try:
        response = table.get_item(
            Key={"pk": f"FACILITY#{facility_id}", "sk": "Metadata"}
        )

        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Facility not found")

        table.delete_item(
            Key={"pk": f"FACILITY#{facility_id}", "sk": "Metadata"}
        )

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error deleting facility: {e}")


@router.get("/{facility_id}/responsibles", description="Obtener emails de responsables de una facility")
async def get_facility_responsibles(facility_id: str):
    """
    Obtiene la lista de emails de responsables configurados para recibir alertas.
    Busca en FACILITY#{facility_id} / RESPONSIBLES
    """
    try:
        # Verificar que la facility existe
        facility_response = table.get_item(
            Key={"pk": f"FACILITY#{facility_id}", "sk": "Metadata"}
        )
        
        if "Item" not in facility_response:
            raise HTTPException(status_code=404, detail="Facility not found")
        
        # Buscar responsables
        response = table.get_item(
            Key={
                "pk": f"FACILITY#{facility_id}",
                "sk": "RESPONSIBLES"
            }
        )
        
        if "Item" not in response:
            return {
                "facility_id": facility_id,
                "responsibles": []
            }
        
        record = response["Item"]
        responsibles = record.get("responsibles", [])
        
        return {
            "facility_id": facility_id,
            "responsibles": responsibles if isinstance(responsibles, list) else []
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching responsibles: {e}")


@router.put("/{facility_id}/responsibles", description="Actualizar emails de responsables de una facility")
async def update_facility_responsibles(facility_id: str, emails: dict):
    """
    Actualiza la lista de emails de responsables para recibir alertas.
    
    Body:
    {
      "responsibles": ["email1@example.com", "email2@example.com"]
    }
    """
    try:
        # Verificar que la facility existe
        facility_response = table.get_item(
            Key={"pk": f"FACILITY#{facility_id}", "sk": "Metadata"}
        )
        
        if "Item" not in facility_response:
            raise HTTPException(status_code=404, detail="Facility not found")
        
        # Validar emails
        responsibles_list = emails.get("responsibles", [])
        
        if not isinstance(responsibles_list, list):
            raise HTTPException(status_code=400, detail="'responsibles' must be a list of emails")
        
        # Validar formato de emails (básico)
        import re
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        for email in responsibles_list:
            if not isinstance(email, str) or not re.match(email_regex, email):
                raise HTTPException(status_code=400, detail=f"Invalid email format: {email}")
        
        # Guardar/actualizar responsables directamente en la facility
        item = {
            "pk": f"FACILITY#{facility_id}",
            "sk": "RESPONSIBLES",
            "facility_id": facility_id,
            "responsibles": responsibles_list,
            "type": "FACILITY_RESPONSIBLES"
        }
        
        table.put_item(Item=item)
        
        return {
            "message": "Responsibles updated successfully",
            "facility_id": facility_id,
            "responsibles": responsibles_list
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating responsibles: {e}")
