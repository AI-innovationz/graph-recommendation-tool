# models/recommendation.py

from pydantic import BaseModel
from .user import User
from .graph_match import GraphMatch


class Recommendation(BaseModel):
    matched_preference: str
    score: float
    confidence:float
    matches:list[GraphMatch]
    helpers: list[User]

