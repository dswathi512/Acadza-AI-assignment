from pydantic import BaseModel
from typing import Optional, Dict, Any


class ReportBase(BaseModel):
    report_id: str
    question_id: str
    student_id: str
    source: str
    reported_at: str
    comment: str


class ReportItem(ReportBase):
    subject: Optional[str] = None
    chapter: Optional[str] = None
    question_type: Optional[str] = None
    verdict: Optional[str] = None
    repair: Optional[str] = None
    route: Optional[str] = None
    confidence: Optional[float] = None
    review_status: Optional[str] = None
