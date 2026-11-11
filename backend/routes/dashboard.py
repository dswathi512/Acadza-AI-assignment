from fastapi import APIRouter
from backend.services.db_service import get_dashboard_metrics

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
def read_dashboard():
    return get_dashboard_metrics()
