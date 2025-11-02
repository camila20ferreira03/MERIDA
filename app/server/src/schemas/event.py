from pydantic import BaseModel

class Event(BaseModel):
    facility_id: str
    event_type: str
    description: str

