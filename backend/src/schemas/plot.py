from pydantic import BaseModel
from typing import Optional
from sensor_data import SensorData

class PlotBase(BaseModel):
    plot_id: str
    facility_id: str
    name: str
    location: str
    species_id: Optional[str] = None

class PlotState(BaseModel):
    plot_id: str
    type: str = "state"
    timestamp: str
    sensor_data: SensorData
    comment: Optional[str] = None


class PlotCreate(PlotBase):
    pass

class PlotUpdate(BaseModel):
    name: Optional[str]
    location: Optional[str]
    species_id: Optional[str]