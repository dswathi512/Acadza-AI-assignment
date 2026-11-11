from fastapi import APIRouter
from backend.services.db_service import get_audit_logs

router = APIRouter(prefix="/audit", tags=["Audit Log"])


@router.get("")
def list_audit_logs(limit: int = 100):
    return get_audit_logs(limit=limit)
