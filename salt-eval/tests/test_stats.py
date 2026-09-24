import copy

import pytest

from salt_eval.stats import (
    clustered_standard_error,
    cohen_kappa,
    minimum_detectable_effect,
    paired_comparison,
    per_task,
    summarize,
)

from .conftest import JUDGE_ROWS, make_record


def rows(**verdicts):
    result = copy.deepcopy(JUDGE_ROWS)
    for row in result:
        row["severity"] = "mandatory"
        if row["id"] in verdicts:
            row["verdict"] = verdicts[row["id"]]
    return result


def test_review_blocks_uplift():
    records = [make_record("A", "t", 1, rows()), make_record("B", "t", 1, rows(**{"state-choice": "review"}))]
    summary = summarize(records, ["A", "B"])
    assert summary["comparisons"]["B"]["uplift_percentage_points"] is None
    assert summary["comparisons"]["B"]["unresolved_tasks"] == ["t"]
    assert summary["status"].startswith("PROVISIONAL")


def test_delta_is_task_weighted():
    records = []
    for task, count, b_pass in [("one", 3, True), ("two", 1, False)]:
        for trial in range(count):
            records.append(make_record("A", task, trial, rows(**{"state-choice": "wrong"})))
            records.append(make_record("B", task, trial, rows() if b_pass else rows(**{"state-choice": "wrong"})))
    comparison = summarize(records, ["A", "B"])["comparisons"]["B"]
    assert comparison["uplift_percentage_points"] == 50.0
    assert comparison["improved_tasks"] == ["one"]
    assert comparison["regressed_tasks"] == []


def test_unpaired_task_blocks_uplift():
    records = [make_record("A", "t", 1, rows()), make_record("A", "t", 2, rows()), make_record("B", "t", 1, rows())]
    comparison = paired_comparison(records, "A", "B")
    assert comparison["unpaired_tasks"] == ["t"]
    assert comparison["uplift_percentage_points"] is None


def test_single_arm_reports_absolute_signals_only():
    records = [make_record("A", "t", 1, rows()), make_record("A", "t", 2, rows(**{"state-owner": "missing"}))]
    summary = summarize(records, ["A"])
    assert summary["comparisons"] == {}
    assert summary["arms"]["A"]["confirmed_pass_fraction"] == 0.5
    assert summary["status"].startswith("Single arm")


def test_avg_at_k_and_pass_pow_k_literal_values():
    records = [make_record("A", "t", trial, rows() if trial < 4 else rows(**{"state-owner": "wrong"})) for trial in range(1, 5)]
    stats = per_task(records)["t"]
    assert stats == {"k": 4, "passes": 3, "avg_at_k": 0.75, "pass_pow_k": 0.75**4, "unresolved": 0}


def test_execution_error_counts_as_unresolved():
    records = [make_record("A", "t", 1, rows(), execution_error=True)]
    summary = summarize(records, ["A"])
    assert summary["arms"]["A"]["outcomes"] == {"execution_error": 1}
    assert summary["unresolved"]["execution_error"] == 1


def test_clustered_standard_error_treats_paraphrases_as_one_unit():
    by_cluster = {"a": [10.0, 10.0], "b": [30.0], "c": [20.0]}
    result = clustered_standard_error(by_cluster)
    assert result["clusters"] == 3
    assert result["cluster_sd_pp"] == pytest.approx(10.0)
    assert result["se_pp"] == pytest.approx(10.0 / 3**0.5)
    assert result["ci95_pp"] == pytest.approx([20 - 1.959964 * 10 / 3**0.5, 20 + 1.959964 * 10 / 3**0.5])
    assert clustered_standard_error({"only": [5.0]})["se_pp"] is None


def test_minimum_detectable_effect_shrinks_with_clusters():
    small = minimum_detectable_effect(20.0, 4)
    large = minimum_detectable_effect(20.0, 16)
    assert small["mde_pp"] == pytest.approx((1.959964 + 0.841621) * 20 / 2)
    assert large["mde_pp"] == pytest.approx(small["mde_pp"] / 2)
    assert small["clusters_for_10pp"] == 32
    assert minimum_detectable_effect(None, 1)["mde_pp"] is None


def test_paired_comparison_reports_clusters_and_mde():
    records = []
    for cluster, tasks in {"c1": ["a", "a-p1"], "c2": ["b"], "c3": ["c"]}.items():
        for task in tasks:
            records.append(make_record("A", task, 1, rows(**{"state-choice": "wrong"}), cluster=cluster))
            records.append(make_record("B", task, 1, rows() if cluster != "c3" else rows(**{"state-choice": "wrong"}), cluster=cluster))
    comparison = paired_comparison(records, "A", "B")
    assert comparison["independent_request_clusters"] == 3
    assert comparison["uplift_percentage_points"] == pytest.approx(75.0)
    assert comparison["clustered"]["clusters"] == 3
    assert comparison["mde"]["mde_pp"] is not None
    assert comparison["bootstrap_95_ci_pp"] is None


def test_cohen_kappa_literal_values():
    assert cohen_kappa([("correct", "correct"), ("wrong", "wrong")]) == 1.0
    assert cohen_kappa([("correct", "wrong"), ("wrong", "correct")]) == pytest.approx(-1.0)
    assert cohen_kappa([("correct", "correct"), ("correct", "wrong"), ("wrong", "wrong"), ("wrong", "wrong")]) == pytest.approx(0.5)
    assert cohen_kappa([("correct", "correct")]) is None
