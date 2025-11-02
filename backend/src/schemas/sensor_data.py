from pydantic import BaseModel

class SensorData(BaseModel):
    temperature: float
    humidity: float
    soil_moisture: float
    light: float