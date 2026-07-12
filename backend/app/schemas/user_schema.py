from pydantic import BaseModel

class CreateUserRequest(BaseModel):
    name: str
    phone: str
    latitude: float
    longitude: float
    