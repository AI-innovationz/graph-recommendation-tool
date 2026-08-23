from dataclasses import dataclass, field
from uuid import uuid4
from datetime import datetime, timezone


from app.models.location import Location
from app.models.enum import UserRole


@dataclass
class User:
    name: str
    phone: str
    location: Location
    

    id: str = field(default_factory = lambda: str(uuid4()))
    role: UserRole = UserRole.USER
    preferences:str = ''
    is_active: bool = True
    created_at: datetime = field(default_factory=lambda:datetime.now(timezone.utc))
    

    def deactive(self):
        self.is_active = False 
        
    def activate(self):
        self.is_active = True

    def update_location(self,location:Location):
        self.location = location
    
    def become_helper(self):
        self.role = UserRole.HELPER
    
    def helper_add_pref(self,preference:list):
        for p in preference:
            self.preference.append(p)
        print(self)

   

