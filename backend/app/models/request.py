from dataclasses import dataclass, field
from datetime import datetime
from uuid import uuid4

from app.models.enum import RequestStatus, RequestType
from app.models.location import Location



@dataclass
class Request:
    user_id: str
    request_type: list[str]
    description: str
    location: Location

    id:str = field(default_factory=lambda:str(uuid4()))
    status: RequestStatus = RequestStatus.CREATED
    created_at: datetime = field(default_factory=datetime.utcnow)



def mark_matched(self):
    self.status = RequestStatus.MATCHED

def complete(self):
    self.status = RequestStatus.COMPLETED

def cancel(self):
    self.status = RequestStatus.CANCELLED