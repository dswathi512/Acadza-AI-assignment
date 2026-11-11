from fastapi import APIRouter
from backend.services.bonus_service import audit_all_questions, get_bonus_findings_from_db

router = APIRouter(prefix="", tags=["Bonus Audit"])


@router.post("/bonus-audit/run")
def trigger_bonus_audit():
    findings = audit_all_questions()
    return {
        "success": True,
        "message": f"Bonus audit executed on all questions. {len(findings)} findings recorded.",
        "findings": findings
    }


@router.get("/bonus-audit")
def read_bonus_findings():
    return get_bonus_findings_from_db()
