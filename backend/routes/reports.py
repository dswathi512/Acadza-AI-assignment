from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from backend.services.db_service import get_reports_list, get_report_detail
from backend.services.investigation_service import run_full_triage

router = APIRouter(prefix="", tags=["Reports"])


@router.get("/reports")
def list_reports(
    verdict: Optional[str] = Query(None),
    repair: Optional[str] = Query(None),
    route: Optional[str] = Query(None),
    review_status: Optional[str] = Query(None),
    min_confidence: Optional[float] = Query(None),
    max_confidence: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    return get_reports_list(
        verdict=verdict,
        repair=repair,
        route=route,
        review_status=review_status,
        min_confidence=min_confidence,
        max_confidence=max_confidence,
        search=search,
        limit=limit,
        offset=offset
    )


@router.get("/reports/{report_id}")
def read_report(report_id: str):
    data = get_report_detail(report_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found")
    return data


@router.post("/triage/run")
def trigger_triage():
    results, summary = run_full_triage()
    return {
        "success": True,
        "message": f"Triage executed for {len(results)} reports",
        "summary": summary
    }
