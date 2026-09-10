from pydantic import BaseModel

class FeedbackItem(BaseModel):
    start: str
    final_node: str
    score: float
    feedback: int
    
class FeedbackObj(BaseModel):
    feedbackBody: list[FeedbackItem]


