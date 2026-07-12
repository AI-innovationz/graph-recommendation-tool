from pydantic import BaseModel
from app.models.request import RequestType

class BecomeHelperRequest(BaseModel):
    preferences: list[str]