"""
Validation and routing service enforcing strict taxonomy, schema, field scope,
and deterministic safety policies.
"""

import json
import os
from typing import Dict, Any, Tuple, Optional, List

TAXONOMY_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "taxonomy.json")


class TaxonomyValidator:
    def __init__(self, taxonomy_file: str = TAXONOMY_PATH):
        with open(taxonomy_file, "r", encoding="utf-8") as f:
            self.taxonomy = json.load(f)
        self.verdicts = self.taxonomy.get("verdicts", {})
        self.repairs = self.taxonomy.get("repairs", {})

    def get_allowed_verdicts(self) -> List[str]:
        return list(self.verdicts.keys())

    def get_allowed_repairs(self) -> List[str]:
        return list(self.repairs.keys())

    def get_repair_meta(self, repair: str) -> Optional[Dict[str, Any]]:
        return self.repairs.get(repair)

    def is_valid_verdict(self, verdict: str) -> bool:
        return verdict in self.verdicts

    def is_valid_repair(self, repair: Optional[str]) -> bool:
        if repair is None:
            return True
        return repair in self.repairs

    def validate_and_route(
        self,
        verdict: str,
        repair: Optional[str],
        edit: Optional[Dict[str, Any]],
        confidence: float,
        question_data: Dict[str, Any]
    ) -> Tuple[bool, str, str, Optional[Dict[str, Any]], str]:
        """
        Validates the proposed triage output and computes the safe deterministic route.
        Returns:
            (is_valid, final_verdict, final_repair, final_edit, final_route)
        """
        # 1. Validate verdict
        if verdict not in self.verdicts:
            return False, "not_actionable", None, None, "no_change"

        # 2. Non-defect verdicts must not have repairs or edits, and must route to no_change
        if verdict != "defect":
            return True, verdict, None, None, "no_change"

        # 3. Defect requires a valid repair category
        if not repair or repair not in self.repairs:
            # Fallback for defect without valid repair
            return False, "defect", None, None, "faculty_review"

        repair_meta = self.repairs[repair]
        allowed_fields = repair_meta.get("fields", [])
        is_auto_allowed = repair_meta.get("auto", False)

        # 4. If repair has no permitted fields (e.g. identical_options, diagram, unsound)
        if not allowed_fields:
            # Cannot auto-apply, must not have unauthorized field edits
            return True, verdict, repair, None, "faculty_review"

        # 5. Validate edit if present
        validated_edit = None
        if edit:
            field = edit.get("field")
            find_str = edit.get("find")
            replace_str = edit.get("replace")

            # Scope check: Field MUST be in allowed_fields
            if field not in allowed_fields:
                # Unauthorized field modification - escalate to faculty review and strip illegal edit
                return True, verdict, repair, None, "faculty_review"

            # Check target content exists in original question data
            target_content = ""
            if field == "question":
                target_content = question_data.get("question_html") or question_data.get("questionHtml") or ""
            elif field == "solution":
                target_content = question_data.get("solution_html") or question_data.get("solutionHtml") or ""
            elif field == "answer":
                target_content = str(question_data.get("answer") or question_data.get("current_answer") or "")

            if find_str and find_str not in target_content:
                # Target string not found in original field! Escalate to faculty review
                return True, verdict, repair, edit, "faculty_review"

            validated_edit = {
                "field": field,
                "find": find_str,
                "replace": replace_str
            }

        # 6. Routing Determination
        # High-risk repairs MUST always go to faculty review
        # answer_key must NEVER be auto-applied without human faculty signoff
        if repair == "answer_key":
            return True, verdict, repair, validated_edit, "faculty_review"

        if not is_auto_allowed:
            return True, verdict, repair, validated_edit, "faculty_review"

        if confidence < 0.88:
            return True, verdict, repair, validated_edit, "faculty_review"

        if not validated_edit or not validated_edit.get("find"):
            return True, verdict, repair, validated_edit, "faculty_review"

        # Low-risk auto-eligible repair with high confidence and verified surgical edit
        return True, verdict, repair, validated_edit, "auto_apply"


# Singleton instance
taxonomy_validator = TaxonomyValidator()
