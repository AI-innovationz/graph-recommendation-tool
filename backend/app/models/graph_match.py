from pydantic import BaseModel

class GraphMatch(BaseModel):
    request_node: str
    score: float
    path: list[str]
    depth: int