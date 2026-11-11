from fastapi import APIRouter, HTTPException
from backend.schemas.review import ReviewApproveRequest, ReviewRejectRequest, ReviewEditRequest
from backend.services.db_service import (
    get_reports_list,
    faculty_approve_case,
    faculty_reject_case,
    faculty_edit_and_approve_case
)
from backend.services.validation_service import taxonomy_validator

router = APIRouter(prefix="/reviews", tags=["Faculty Review"])


@router.get("/pending")
def list_pending_reviews():
    """Lists all cases routed to faculty review that are pending review."""
    return get_reports_list(route="faculty_review", review_status="pending")


@router.post("/{report_id}/approve")
def approve_review(report_id: str, payload: ReviewApproveRequest):
    result = faculty_approve_case(report_id, notes=payload.notes)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result


@router.post("/{report_id}/reject")
def reject_review(report_id: str, payload: ReviewRejectRequest):
    result = faculty_reject_case(report_id, reason=payload.reason)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result


@router.post("/{report_id}/edit")
def edit_and_approve_review(report_id: str, payload: ReviewEditRequest):
    result = faculty_edit_and_approve_case(
        report_id=report_id,
        field=payload.field,
        find_str=payload.find,
        replace_str=payload.replace,
        notes=payload.notes
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result
