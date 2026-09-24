import copy

import pytest

from salt_eval.review import apply_reviews, export_queue, failed_criteria_without_attribution
from salt_eval.stats import record_outcome

from .conftest import JUDGE_ROWS, make_record, write_json


def rows(**verdicts):
    result = copy.deepcopy(JUDGE_ROWS)
    for row in result:
        row["severity"] = "mandatory"
        row["verdict"] = verdicts.get(row["id"], row["verdict"])
    return result


def review(response_id, reviewer, **labels):
    return {
        "response_id": response_id,
        "reviewer": reviewer,
        "labels": [
            {"id": cid, "verdict": v[0], "reason": "checked", **({"attribution": v[1]} if len(v) > 1 else {})}
            for cid, v in labels.items()
        ],
    }


def test_agreeing_reviewers_override_and_yield_kappa_one(tmp_path):
    record = make_record("A", "t", 1, rows(**{"state-owner": "correct"}), case={"criteria": []}, response="x")
    path = write_json(
        tmp_path / "reviews.json",
        [
            review("A-t-1", "alice", **{"state-owner": ("wrong", "knowledge-missing"), "state-choice": ("correct",)}),
            review("A-t-1", "bob", **{"state-owner": ("wrong",), "state-choice": ("correct",)}),
        ],
    )
    audit = apply_reviews([record], path)
    owner = next(r for r in record["effective"] if r["id"] == "state-owner")
    assert owner["verdict"] == "wrong" and owner["human_reviewed"] and owner["attribution"] == "knowledge-missing"
    assert record_outcome(record) == "fail"
    assert audit["false_accepts"] == 1 and audit["false_accept_rate"] == 1.0
    assert audit["inter_rater"] == {"alice vs bob": {"items": 2, "kappa": 1.0}}
    assert audit["attribution"]["knowledge-missing"] == 1
    assert failed_criteria_without_attribution([record]) == 0


def test_disagreeing_reviewers_leave_the_criterion_unresolved(tmp_path):
    record = make_record("A", "t", 1, rows())
    path = write_json(
        tmp_path / "reviews.json",
        [review("A-t-1", "alice", **{"state-owner": ("wrong",)}), review("A-t-1", "bob", **{"state-owner": ("correct",)})],
    )
    audit = apply_reviews([record], path)
    owner = next(r for r in record["effective"] if r["id"] == "state-owner")
    assert owner["verdict"] == "review"
    assert owner["reason"] == "reviewers disagree: alice=wrong; bob=correct"
    assert record_outcome(record) == "review"
    assert audit["disagreements"] == 1
    assert audit["inter_rater"]["alice vs bob"]["kappa"] is None


def test_override_requires_reviewer_and_reason(tmp_path):
    record = make_record("A", "t", 1, rows())
    path = write_json(tmp_path / "reviews.json", [{"response_id": "A-t-1", "reviewer": "", "labels": [{"id": "state-owner", "verdict": "wrong", "reason": "x"}]}])
    with pytest.raises(ValueError, match="reviewer and reason"):
        apply_reviews([record], path)


def test_queue_is_blinded_and_written_once(tmp_path):
    records = [
        make_record(arm, "t", 1, rows(), case={"request": "r", "criteria": [{"id": "state-choice"}], "references": []}, response=f"answer {arm}", artifact=None)
        for arm in ("A", "B")
    ]
    path = tmp_path / "queue.json"
    queue = export_queue(records, path)
    assert len(queue) == 2
    assert all(set(item) == {"response_id", "reviewer", "request", "response", "artifact", "criteria", "references", "labels"} for item in queue)
    assert export_queue([records[0]], path) == queue
