import asyncio
import json

import pytest
from inspect_ai.model import ModelOutput, get_model

from salt_eval.judge import judge_response, normalize_judgment, outcome
from salt_eval.suites import judge_criteria

from .conftest import GOOD_RESPONSE


def test_fabricated_evidence_cannot_pass(readonly_case, judge_rows):
    judge_rows[0]["quotes"] = ["This was never said"]
    with pytest.raises(ValueError, match="absent from the response"):
        normalize_judgment(json.dumps({"criteria": judge_rows}), judge_criteria(readonly_case), GOOD_RESPONSE)


def test_omitted_criterion_cannot_pass(readonly_case, judge_rows):
    with pytest.raises(ValueError, match="each criterion exactly once"):
        normalize_judgment(json.dumps({"criteria": judge_rows[:1]}), judge_criteria(readonly_case), GOOD_RESPONSE)


def test_source_outside_criterion_is_rejected(readonly_case, judge_rows):
    judge_rows[0]["source_ids"] = ["formfield-state"]
    with pytest.raises(ValueError, match="Unrecognized criterion source"):
        normalize_judgment(json.dumps({"criteria": judge_rows}), judge_criteria(readonly_case), GOOD_RESPONSE)


def test_valid_judgment_is_ordered_and_carries_severity(readonly_case, judge_rows):
    rows = normalize_judgment(json.dumps({"criteria": list(reversed(judge_rows))}), judge_criteria(readonly_case), GOOD_RESPONSE)
    assert [r["id"] for r in rows] == ["state-choice", "state-owner"]
    assert {r["severity"] for r in rows} == {"mandatory"}


def test_empty_judgment_is_unresolved():
    assert outcome([]) == "review"


def test_advisory_failure_does_not_fail_the_response():
    rows = [
        {"id": "a", "verdict": "correct", "severity": "mandatory"},
        {"id": "b", "verdict": "wrong", "severity": "advisory"},
    ]
    assert outcome(rows) == "pass"
    rows[0]["verdict"] = "review"
    assert outcome(rows) == "review"
    rows[0]["verdict"] = "missing"
    assert outcome(rows) == "fail"


def test_invalid_judge_output_becomes_review_rows(readonly_case):
    judge = get_model("mockllm/judge", custom_outputs=[ModelOutput.from_content("mockllm/judge", "not json")], memoize=False)
    result = asyncio.run(judge_response(judge_criteria(readonly_case), readonly_case, GOOD_RESPONSE, judge))
    assert [r["verdict"] for r in result["criteria"]] == ["review", "review"]
    assert result["validation_error"].startswith("Judge output invalid")
    assert outcome(result["criteria"]) == "review"


def test_judge_payload_is_blinded(readonly_case, judge_rows):
    seen = {}

    def callback(messages, tools, tool_choice, config):
        seen["payload"] = json.loads(messages[-1].text)
        return ModelOutput.from_content("mockllm/judge", json.dumps({"criteria": judge_rows}))

    judge = get_model("mockllm/judge", custom_outputs=callback, memoize=False)
    result = asyncio.run(judge_response(judge_criteria(readonly_case), readonly_case, GOOD_RESPONSE, judge))
    assert set(seen["payload"]) == {"request", "criteria", "trusted_references", "candidate_response"}
    assert [c["id"] for c in seen["payload"]["criteria"]] == ["state-choice", "state-owner"]
    assert outcome(result["criteria"]) == "pass"
