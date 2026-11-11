from pydantic import BaseModel
from typing import Optional


class BonusFindingItem(BaseModel):
    id: Optional[int] = None
    question_id: str
    potential_issue: str
    evidence: str
    confidence: float
    suggested_repair: Optional[str] = None
    recommended_route: str
