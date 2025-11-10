from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from uuid import uuid4

class SpeciesBase(BaseModel):
    name: str 
    #common_name: Optional[str] = Field(None, description="Common name of the species")
    #family: str = Field(..., description="Taxonomic family of the species")
    #description: Optional[str] = Field(None, description="Description of the species")
    #conservation_status: Optional[str] = Field(None, description="Conservation status of the species")

class Species(SpeciesBase):
    species_id: str
    species: str
    type: str

class SpeciesCreate(SpeciesBase):
    pass

class SpeciesThresholds(BaseModel):
    """Umbrales ideales para una especie"""
    species_id: str
    MinTemperature: Optional[float] = Field(None, description="Temperatura mínima ideal (°C)")
    MaxTemperature: Optional[float] = Field(None, description="Temperatura máxima ideal (°C)")
    MinHumidity: Optional[float] = Field(None, description="Humedad mínima ideal (%)")
    MaxHumidity: Optional[float] = Field(None, description="Humedad máxima ideal (%)")
    MinLight: Optional[float] = Field(None, description="Luz mínima ideal (lux)")
    MaxLight: Optional[float] = Field(None, description="Luz máxima ideal (lux)")
    MinIrrigation: Optional[float] = Field(None, description="Riego mínimo ideal (mm/día)")
    MaxIrrigation: Optional[float] = Field(None, description="Riego máximo ideal (mm/día)")

class SpeciesThresholdsUpdate(BaseModel):
    """Actualización de umbrales para una especie"""
    MinTemperature: Optional[float] = None
    MaxTemperature: Optional[float] = None
    MinHumidity: Optional[float] = None
    MaxHumidity: Optional[float] = None
    MinLight: Optional[float] = None
    MaxLight: Optional[float] = None
    MinIrrigation: Optional[float] = None
    MaxIrrigation: Optional[float] = None