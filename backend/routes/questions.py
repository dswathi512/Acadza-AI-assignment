from fastapi import APIRouter, HTTPException
from backend.services.db_service import get_question_detail

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.get("/{question_id}")
def read_question(question_id: str):
    data = get_question_detail(question_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Question {question_id} not found")
    return data
