from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class QuestionBase(BaseModel):
    id: str
    qid: Optional[str] = None
    question_type: str
    subject: Optional[str] = None
    chapter: Optional[str] = None
    concept: Optional[str] = None
    sub_concept: Optional[str] = None
    level: Optional[str] = None


class QuestionDetail(QuestionBase):
    question_html: str
    solution_html: str
    answer: str
    options: Dict[str, str] = {}
    ques_images: List[str] = []
    solution_images: List[str] = []
    current_question_html: str
    current_solution_html: str
    current_answer: str
    is_modified: bool = False
    reports_count: int = 0
