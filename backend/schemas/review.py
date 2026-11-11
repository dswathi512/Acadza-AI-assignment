from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.schemas.triage import EditPayload


class ReviewApproveRequest(BaseModel):
    notes: Optional[str] = "Approved by faculty"


class ReviewRejectRequest(BaseModel):
    reason: str = "Rejected by faculty"


class ReviewEditRequest(BaseModel):
    field: str
    find: Optional[str] = None
    replace: Optional[str] = None
    notes: Optional[str] = "Edited and approved by faculty"


class ReviewDecisionResponse(BaseModel):
    success: bool
    report_id: str
    question_id: str
    status: str
    message: str
