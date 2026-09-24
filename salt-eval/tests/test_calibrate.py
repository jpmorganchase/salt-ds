import asyncio
import json

from inspect_ai.model import ModelOutput, get_model

from salt_eval.calibrate import calibrate_suite, threshold_failures


def judge_that(strategy):
    """strategy(criterion_id, response) -> verdict. Quotes are taken from the response itself."""

    def callback(messages, tools, tool_choice, config):
        payload = json.loads(messages[-1].text)
        response = payload["candidate_response"]
        rows = []
        for criterion in payload["criteria"]:
            verdict = strategy(criterion["id"], response)
            rows.append(
                {
                    "id": criterion["id"],
                    "verdict": verdict,
                    "quotes": [response.split(".")[0]] if verdict in {"correct", "wrong"} else [],
                    "source_ids": criterion["source_ids"][:1] if verdict in {"correct", "wrong"} else [],
                    "reason": "calibration stub",
                }
            )
        return ModelOutput.from_content("mockllm/judge", json.dumps({"criteria": rows}))

    return get_model("mockllm/judge", custom_outputs=callback, memoize=False)


def test_oracle_judge_meets_the_thresholds(example_suite):
    expected = {}
    for case in example_suite.cases:
        path = example_suite.calibration_path(case)
        for example in json.loads(path.read_text())["examples"]:
            expected[example["response"]] = example["expected"]
    oracle = judge_that(lambda cid, response: expected[response][cid])
    result = asyncio.run(calibrate_suite(example_suite, oracle))
    assert result["failures"] == []
    assert result["rates"] == {"false_accept_rate": 0.0, "false_reject_rate": 0.0, "review_rate": 0.0, "exact_agreement_rate": 1.0}
    assert result["counts"]["labels"] == 13
    assert [c["case_id"] for c in result["cases"]] == ["salt-readonly-001", "salt-readonly-code-001"]


def test_rubber_stamp_judge_fails_false_accept_threshold(example_suite):
    result = asyncio.run(calibrate_suite(example_suite, judge_that(lambda cid, response: "correct")))
    assert result["rates"]["false_accept_rate"] == 1.0
    assert result["rates"]["false_reject_rate"] == 0.0
    assert result["failures"] == ["false_accept_rate 1.00 exceeds max_false_accept_rate 0.00"]


def test_threshold_failures_list_each_breach():
    rates = {"false_accept_rate": 0.5, "false_reject_rate": None, "review_rate": 0.3}
    thresholds = {"max_false_accept_rate": 0.1, "max_false_reject_rate": 0.1, "max_review_rate": 0.2}
    assert threshold_failures(rates, thresholds) == [
        "false_accept_rate 0.50 exceeds max_false_accept_rate 0.10",
        "review_rate 0.30 exceeds max_review_rate 0.20",
    ]
