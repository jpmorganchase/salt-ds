"""Run the real judge on maintainer-labelled responses and hold it to the suite's thresholds."""

from collections import Counter

from .judge import FAILING, judge_response
from .schema import load_validated
from .suites import Suite, judge_criteria


def score_example(rows: list[dict], expected: dict[str, str]) -> Counter:
    counts: Counter = Counter()
    for row in rows:
        want = expected[row["id"]]
        counts["labels"] += 1
        counts["exact_agreement"] += int(row["verdict"] == want)
        counts["reviews"] += int(row["verdict"] == "review")
        counts["known_incorrect"] += int(want != "correct")
        counts["known_correct"] += int(want == "correct")
        counts["false_accepts"] += int(want != "correct" and row["verdict"] == "correct")
        counts["false_rejects"] += int(want == "correct" and row["verdict"] in FAILING)
    return counts


def rates(counts: Counter) -> dict:
    def ratio(numerator: str, denominator: str):
        return counts[numerator] / counts[denominator] if counts[denominator] else None

    return {
        "false_accept_rate": ratio("false_accepts", "known_incorrect"),
        "false_reject_rate": ratio("false_rejects", "known_correct"),
        "review_rate": ratio("reviews", "labels"),
        "exact_agreement_rate": ratio("exact_agreement", "labels"),
    }


def threshold_failures(observed: dict, thresholds: dict) -> list[str]:
    found = []
    for rate, limit in (
        ("false_accept_rate", "max_false_accept_rate"),
        ("false_reject_rate", "max_false_reject_rate"),
        ("review_rate", "max_review_rate"),
    ):
        value = observed.get(rate)
        if value is not None and value > thresholds[limit]:
            found.append(f"{rate} {value:.2f} exceeds {limit} {thresholds[limit]:.2f}")
    return found


async def calibrate_suite(suite: Suite, judge_model) -> dict:
    """Judge every calibration example of every case with judge criteria. Returns results and failures."""
    total: Counter = Counter()
    cases = []
    for case in suite.cases:
        criteria = judge_criteria(case)
        path = suite.calibration_path(case)
        if not criteria or path is None:
            continue
        data = load_validated("calibration", path)
        counts: Counter = Counter()
        examples = []
        for example in data["examples"]:
            result = await judge_response(criteria, case, example["response"], judge_model)
            counts += score_example(result["criteria"], example["expected"])
            examples.append({"example_id": example["id"], "expected": example["expected"], **result})
        total += counts
        cases.append({"case_id": case["id"], "labels_status": data["status"], "counts": dict(counts), "rates": rates(counts), "examples": examples})
    observed = rates(total)
    return {
        "suite": suite.id,
        "judge_thresholds": suite.manifest["judge_thresholds"],
        "counts": dict(total),
        "rates": observed,
        "failures": threshold_failures(observed, suite.manifest["judge_thresholds"]),
        "cases": cases,
        "warning": "Agreement on these examples is a smoke check, not evidence of a low general error rate.",
    }
