from pydantic import BaseModel
from typing import Optional


class AuditLogItem(BaseModel):
    id: int
    report_id: Optional[str] = None
    question_id: str
    action: str
    field_changed: Optional[str] = None
    previous_value: Optional[str] = None
    updated_value: Optional[str] = None
    faculty_action: Optional[str] = None
    notes: Optional[str] = None
    timestamp: str
