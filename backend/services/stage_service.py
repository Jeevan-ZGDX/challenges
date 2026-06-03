import json
from pathlib import Path

from models.schemas import Stage

STAGE_FILE = Path(__file__).resolve().parent.parent / "stages" / "stages.json"


def load_stages() -> list[Stage]:
    with STAGE_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)
    return [Stage(**item) for item in data]



def get_stage_by_id(stage_id: int) -> Stage:
    stages = load_stages()
    for stage in stages:
        if stage.id == stage_id:
            return stage
    raise ValueError(f"Stage {stage_id} not found")


def load_roles() -> list[dict]:
    # Simple static role list. Keep ids as strings to match frontend expectations.
    return [
        {"id": "employee", "label": "Employee", "description": "General professional role."},
        {"id": "manager", "label": "Manager", "description": "Mid-level manager responsibilities."},
        {"id": "engineer", "label": "Engineer", "description": "Technical contributor role."},
    ]
