"""Blinded human review: export the queue, apply labels, measure agreement, attribute failures."""

from collections import Counter, defaultdict
import json
from pathlib import Path
import random

from .judge import FAILING
from .schema import load_validated
from .stats import cohen_kappa

QUEUE_FILE = "review-queue.json"
ATTRIBUTIONS = (
    "knowledge-missing",
    "tool-not-discovered",
    "tool-response-incomplete",
    "agent-ignored-evidence",
    "rubric-error",
)


def export_queue(records: list[dict], path: Path) -> list[dict]:
    """Write the blinded queue once. Arm labels and automatic verdicts are deliberately absent."""
    if path.exists():
        return json.loads(path.read_text())
    queue = [
        {
            "response_id": r["response_id"],
            "reviewer": "",
            "request": r["case"]["request"],
            "response": r["response"],
            "artifact": r.get("artifact"),
            "criteria": r["case"]["criteria"],
            "references": r["case"]["references"],
            "labels": [{"id": c["id"], "verdict": "unreviewed", "reason": ""} for c in r["case"]["criteria"]],
        }
        for r in records
        if not r["execution_error"]
    ]
    random.Random(91).shuffle(queue)
    path.write_text(json.dumps(queue, indent=2))
    return queue


def apply_reviews(records: list[dict], review_path: Path | str | None) -> dict:
    """Overlay human verdicts on `effective` rows. Disagreements between reviewers stay `review`.

    Returns the audit: false accept/reject rates of the automatic judge against human labels,
    Cohen's kappa between reviewer pairs, and failure attribution counts.
    """
    audit: Counter = Counter()
    attribution: Counter = Counter()
    if not review_path:
        return _finish(audit, attribution, {})
    reviews = load_validated("review", Path(review_path))
    index = {r["response_id"]: r for r in records}
    labels: dict[tuple[str, str], dict[str, dict]] = defaultdict(dict)
    for review in reviews:
        if review["response_id"] not in index:
            raise ValueError(f"Review for unknown response {review['response_id']}")
        for human in review["labels"]:
            if human["verdict"] == "unreviewed":
                continue
            if not review.get("reviewer") or not human.get("reason"):
                raise ValueError("Human overrides require reviewer and reason")
            key = (review["response_id"], human["id"])
            if review["reviewer"] in labels[key]:
                raise ValueError(f"Reviewer {review['reviewer']} labelled {key} twice")
            labels[key][review["reviewer"]] = human
            if human.get("attribution"):
                attribution[human["attribution"]] += 1

    by_pair: dict[tuple[str, str], list[tuple[str, str]]] = defaultdict(list)
    for (response_id, criterion_id), by_reviewer in labels.items():
        record = index[response_id]
        auto = next(row for row in record["effective"] if row["id"] == criterion_id)
        reviewers = sorted(by_reviewer)
        verdicts = {by_reviewer[r]["verdict"] for r in reviewers}
        for i, left in enumerate(reviewers):
            for right in reviewers[i + 1 :]:
                by_pair[(left, right)].append((by_reviewer[left]["verdict"], by_reviewer[right]["verdict"]))
        if len(verdicts) > 1:
            auto.update(
                verdict="review",
                reason="reviewers disagree: " + "; ".join(f"{r}={by_reviewer[r]['verdict']}" for r in reviewers),
                human_reviewed=True,
                reviewers=reviewers,
            )
            audit["disagreements"] += 1
            continue
        human = by_reviewer[reviewers[0]]
        verdict = human["verdict"]
        original = next(row["verdict"] for row in record["automatic"] if row["id"] == criterion_id)
        if verdict != "review" and original != "review":
            human_pass, auto_pass = verdict == "correct", original == "correct"
            audit["human_correct" if human_pass else "human_incorrect"] += 1
            audit["false_accepts"] += int(auto_pass and not human_pass)
            audit["false_rejects"] += int(not auto_pass and human_pass)
        auto.update(verdict=verdict, reason=human["reason"], human_reviewed=True, reviewers=reviewers)
        if human.get("attribution"):
            auto["attribution"] = human["attribution"]
    kappa = {f"{left} vs {right}": {"items": len(pairs), "kappa": cohen_kappa(pairs)} for (left, right), pairs in sorted(by_pair.items())}
    return _finish(audit, attribution, kappa)


def _finish(audit: Counter, attribution: Counter, kappa: dict) -> dict:
    result = dict(audit)
    for name, numerator, denominator in [
        ("false_accept_rate", "false_accepts", "human_incorrect"),
        ("false_reject_rate", "false_rejects", "human_correct"),
    ]:
        result[name] = audit[numerator] / audit[denominator] if audit[denominator] else None
    result["inter_rater"] = kappa
    result["attribution"] = {label: attribution.get(label, 0) for label in ATTRIBUTIONS}
    result["interpretation"] = "Rates describe reviewed labels only; targeted sampling is not a population estimate."
    return result


def failed_criteria_without_attribution(records: list[dict]) -> int:
    return sum(
        1
        for r in records
        for row in r["effective"]
        if row["verdict"] in FAILING and row.get("severity", "mandatory") == "mandatory" and not row.get("attribution")
    )
