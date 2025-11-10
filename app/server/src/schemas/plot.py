from pydantic import BaseModel
from typing import Optional
from src.schemas.sensor_data import SensorData

class PlotBase(BaseModel):
    facility_id: str
    name: str
    location: str
    mac_address: str
    species: Optional[str] = None
    area: Optional[float] = None

class Plot(PlotBase):
    plot_id: str

class PlotCreate(PlotBase):
    pass

class PlotUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    species: Optional[str] = None
    area: Optional[float] = None
    mac_address: Optional[str] = None