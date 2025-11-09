from pydantic import BaseModel, Field
from typing import List, Optional

class FacilityBase(BaseModel):
    facility_id: str
    name: str
    location: str

class FacilityCreate(FacilityBase):
    pass

class FacilityUpdate(BaseModel):
    name: Optional[str]
    location: Optional[str]

class FacilityRead(FacilityBase):
    pass