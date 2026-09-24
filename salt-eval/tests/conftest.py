"""Shared fixtures. Every test here runs offline with Inspect's mockllm models."""

import copy
import json
from pathlib import Path

import pytest

from salt_eval.suites import load_suite

HERE = Path(__file__).resolve().parent
PACKAGE = HERE.parent
EXAMPLE_SUITE = PACKAGE / "suites" / "salt-core-v1"

GOOD_RESPONSE = "Use readOnly on FormField. Keep the existing Input and label."
JUDGE_ROWS = [
    {
        "id": "state-choice",
        "verdict": "correct",
        "quotes": ["Use readOnly"],
        "source_ids": ["input-state"],
        "reason": "Explicit read-only state.",
    },
    {
        "id": "state-owner",
        "verdict": "correct",
        "quotes": ["readOnly on FormField"],
        "source_ids": ["formfield-state"],
        "reason": "Identifies the containing component.",
    },
]


@pytest.fixture(scope="session")
def example_suite():
    return load_suite(EXAMPLE_SUITE)


@pytest.fixture(scope="session")
def readonly_case(example_suite):
    return example_suite.case("salt-readonly-001")


@pytest.fixture
def judge_rows():
    return copy.deepcopy(JUDGE_ROWS)


def make_record(arm: str, task: str, trial: int, rows: list[dict], cluster: str | None = None, **extra) -> dict:
    record = {
        "response_id": f"{arm}-{task}-{trial}",
        "arm": arm,
        "task": task,
        "trial": trial,
        "epoch": 1,
        "cluster": cluster or task,
        "track": "instruct",
        "automatic": copy.deepcopy(rows),
        "effective": copy.deepcopy(rows),
        "execution_error": False,
    }
    record.update(extra)
    return record


def write_json(path: Path, data) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2))
    return path


def copy_suite(tmp_path: Path, source: Path = EXAMPLE_SUITE) -> Path:
    """A writable copy of the example suite for tests that mutate files."""
    import shutil

    target = tmp_path / source.name
    shutil.copytree(source, target)
    return target
