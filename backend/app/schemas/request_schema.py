from pydantic import BaseModel

class CreateRequest(BaseModel):
    user_id: str
    request_type: list[str]
    description: str
    latitude:float
    longitude: float