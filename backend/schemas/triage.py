from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Union


class EditPayload(BaseModel):
    field: str
    find: Optional[str] = None
    replace: Optional[str] = None


class TriageResultItem(BaseModel):
    reportId: str
    questionId: str
    verdict: str
    repair: Optional[str] = None
    edit: Optional[Union[EditPayload, Dict[str, Any]]] = None
    route: str
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: str
    student_reply: str


class TriageSummary(BaseModel):
    total_reports: int
    total_questions: int
    defects_detected: int
    auto_resolved: int
    awaiting_faculty_review: int
    no_change_required: int
    avg_confidence: float
    verdict_distribution: Dict[str, int]
    repair_distribution: Dict[str, int]
    route_distribution: Dict[str, int]
    review_status_distribution: Dict[str, int]
