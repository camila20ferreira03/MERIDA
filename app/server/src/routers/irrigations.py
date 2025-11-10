from fastapi import APIRouter, Depends, HTTPException
from boto3.dynamodb.conditions import Key, Attr
from src.dal.database import table

"""
💧 Riegos
GET /plots/{plot_id}/last-irrigation
GET /plots/{plot_id}/irrigations
POST /plots/{plot_id}/irrigation
"""

router = APIRouter(prefix="/irrigations", tags=["Riegos"])

@router.get("/plot/{plot_id}/last-irrigation",  description="Obtener el último riego de una parcela")
async def get_last_irrigation(plot_id: str):
    try:
        response = table.query(
            KeyConditionExpression=Key("pk").eq(f"PLOT#{plot_id}") & Key("sk").begins_with("EVENT#"),
            ScanIndexForward=False,  # orden descendente (último primero)
            Limit=1
        )

        items = response.get("Items", [])
        if not items:
            raise HTTPException(status_code=404, detail="No irrigation events found for this plot")

        last_event = items[0] # Se puede devolver solo el cuerpo o el ítem entero
        
        print(f"Last event item keys: {last_event.keys()}")
        print(f"Last event sk: {last_event.get('sk')}")
        print(f"Last event Timestamp: {last_event.get('Timestamp')}")
        
        # Get timestamp from Timestamp field first
        timestamp = last_event.get("Timestamp") or last_event.get("timestamp")
        
        # If no Timestamp field, extract from sk (EVENT#timestamp)
        if not timestamp and "sk" in last_event:
            sk_value = last_event["sk"]
            print(f"Extracting from sk: {sk_value}")
            if "#" in sk_value:
                # Extract timestamp from sk like "EVENT#2025-11-10T15:30:00Z"
                sk_parts = sk_value.split("#", 1)
                if len(sk_parts) > 1:
                    timestamp = sk_parts[1]
                    print(f"Extracted timestamp: {timestamp}")
            else:
                timestamp = sk_value
        
        # If still no timestamp, use sk as-is
        if not timestamp:
            timestamp = last_event.get("sk", "")
            print(f"Using sk as-is: {timestamp}")
        
        print(f"Returning timestamp: {timestamp}")
        
        return {
            "plot_id": plot_id,
            "last_irrigation": timestamp,
            "details": last_event
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obtaining last irrigation: {e}")
    

@router.get("/plot/{plot_id}/irrigations", description="Obtener todos los riegos de una parcela")
async def get_irrigations(plot_id: str):
    try:
        response = table.query(
            KeyConditionExpression=Key("pk").eq(f"PLOT#{plot_id}") & Key("sk").begins_with("EVENT#"),
            ScanIndexForward=False  # opcional: False para más recientes primero
        )
        items = response.get("Items", [])

        return {
            "count": len(items),
            "irrigations": items
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obtaining irrigations: {e}")


@router.get("/facility/{facility_id}/irrigations", description="Obtener riegos de todos los plots de una facility en una fecha")
async def get_facility_irrigations(facility_id: str, date: str = None):
    """
    Obtener irrigaciones de una facility en una fecha específica.
    date format: YYYY-MM-DD (ejemplo: 2024-11-10)
    """
    try:
        from datetime import datetime, timedelta
        
        # Si no se proporciona fecha, usar hoy
        if not date:
            target_date = datetime.utcnow().date()
        else:
            try:
                target_date = datetime.strptime(date, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
        # Calcular rango de timestamps para el día completo
        start_time = datetime.combine(target_date, datetime.min.time()).isoformat() + "Z"
        end_time = datetime.combine(target_date, datetime.max.time()).isoformat() + "Z"
        
        # Consultar usando el GSI principal con facility_id
        response = table.query(
            IndexName="GSI",
            KeyConditionExpression=Key("GSI_PK").eq(f"FACILITY#{facility_id}"),
            FilterExpression=Attr("sk").begins_with("EVENT#") & 
                           Attr("Timestamp").between(start_time, end_time)
        )
        
        items = response.get("Items", [])
        
        # Organizar por plot_id
        irrigations_by_plot = {}
        for item in items:
            plot_id = item.get("PlotId") or item.get("plot_id")
            if plot_id:
                if plot_id not in irrigations_by_plot:
                    irrigations_by_plot[plot_id] = []
                irrigations_by_plot[plot_id].append({
                    "timestamp": item.get("Timestamp"),
                    "details": item
                })
        
        return {
            "facility_id": facility_id,
            "date": date or target_date.isoformat(),
            "irrigations_by_plot": irrigations_by_plot,
            "total_events": len(items)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obtaining facility irrigations: {str(e)}")
