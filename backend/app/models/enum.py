from enum import Enum

class UserRole(Enum):
    USER = "USER"
    HELPER = "HELPER"
    ADMIN = "ADMIN"

class RequestStatus(Enum):
    CREATED = "CREATED"
    MATCHED = "MATCHED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class RequestType(Enum):
    GROCERY = "GROCERY"
    MEDICINE = "MEDICINE"
    TRANSPORT = "TRANSPORT"
    EMERGENCY = "EMERGENCY"
    ELDER_CARE = "ELDER_CARE"
    PET_CARE = "PET_CARE"
    FOOD = "FOOD"
    OTHER = "OTHER"
    Blood_Donation = "Blood Donation"