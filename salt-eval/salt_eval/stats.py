"""Pure statistics over records. No I/O, no Inspect types.

A record needs: arm, task, trial, epoch, cluster, effective (criterion rows),
execution_error. Everything else is optional and only enriches the summary.
"""

from collections import Counter, defaultdict
import math
import random
import statistics

from .judge import outcome

BOOTSTRAP_MIN_CLUSTERS = 10
BOOTSTRAP_DRAWS = 5000
Z_95 = 1.959964
Z_POWER_80 = 0.841621


def record_outcome(record: dict) -> str:
    if record["execution_error"]:
        return "execution_error"
    return outcome(record["effective"])


def is_unresolved(record: dict) -> bool:
    return record_outcome(record) in {"execution_error", "review"}


def mean_or_none(values):
    values = list(values)
    return statistics.mean(values) if values else None


def guard_summary(items: list[dict]) -> dict:
    guards = [r["guard"] for r in items if r.get("guard")]
    if not guards:
        return {}
    summary = {}
    for key in ("input_tokens", "output_tokens", "total_tokens", "tool_calls", "messages", "total_time_s", "working_time_s", "cost_usd"):
        values = [g[key] for g in guards if g.get(key) is not None]
        summary[key] = {"mean": mean_or_none(values), "total": sum(values) if values else None}
    return summary


def criterion_breakdown(items: list[dict]) -> dict:
    counts: dict[str, Counter] = defaultdict(Counter)
    for record in items:
        for row in record["effective"]:
            counts[row["id"]][row["verdict"]] += 1
    return {cid: dict(c) for cid, c in sorted(counts.items())}


def per_task(items: list[dict]) -> dict:
    """Per task: k trials, passes, avg@k (pass fraction) and pass^k (all k pass, estimated as p^k)."""
    by_task = defaultdict(list)
    for record in items:
        by_task[record["task"]].append(record)
    result = {}
    for task, trials in sorted(by_task.items()):
        k = len(trials)
        passes = sum(record_outcome(r) == "pass" for r in trials)
        p = passes / k
        result[task] = {"k": k, "passes": passes, "avg_at_k": p, "pass_pow_k": p**k, "unresolved": sum(is_unresolved(r) for r in trials)}
    return result


def arm_summary(items: list[dict]) -> dict:
    states = Counter(record_outcome(r) for r in items)
    decisions = Counter(row["verdict"] for r in items for row in r["effective"])
    tasks = per_task(items)
    return {
        "trials": len(items),
        "outcomes": dict(states),
        "decisions": dict(decisions),
        "confirmed_pass_fraction": states["pass"] / len(items) if items else None,
        "avg_at_k": mean_or_none(t["avg_at_k"] for t in tasks.values()),
        "pass_pow_k": mean_or_none(t["pass_pow_k"] for t in tasks.values()),
        "no_artifact": sum(r.get("failure_reason") == "no-artifact" for r in items),
        "unresolved": sum(is_unresolved(r) for r in items),
        "tasks": tasks,
        "criteria": criterion_breakdown(items),
        "guard": guard_summary(items),
    }


def clustered_standard_error(deltas_by_cluster: dict[str, list[float]]) -> dict:
    """Standard error of the mean task delta treating each cluster as one independent unit."""
    means = [statistics.mean(d) for d in deltas_by_cluster.values()]
    n = len(means)
    if n < 2:
        return {"clusters": n, "se_pp": None, "ci95_pp": None, "cluster_sd_pp": None}
    sd = statistics.stdev(means)
    se = sd / math.sqrt(n)
    grand = statistics.mean(means)
    return {"clusters": n, "se_pp": se, "ci95_pp": [grand - Z_95 * se, grand + Z_95 * se], "cluster_sd_pp": sd}


def minimum_detectable_effect(cluster_sd_pp: float | None, clusters: int) -> dict:
    """Smallest true uplift (pp) this suite detects with 80% power at two-sided alpha 0.05,
    plus the cluster count needed to detect 5 and 10 pp. Both use the normal approximation."""
    if cluster_sd_pp is None or clusters < 2:
        return {"mde_pp": None, "clusters_for_5pp": None, "clusters_for_10pp": None}
    factor = Z_95 + Z_POWER_80
    return {
        "mde_pp": factor * cluster_sd_pp / math.sqrt(clusters),
        "clusters_for_5pp": math.ceil((factor * cluster_sd_pp / 5) ** 2) if cluster_sd_pp else 0,
        "clusters_for_10pp": math.ceil((factor * cluster_sd_pp / 10) ** 2) if cluster_sd_pp else 0,
    }


def cluster_bootstrap(deltas_by_cluster: dict[str, list[float]], draws: int = BOOTSTRAP_DRAWS) -> list[float] | None:
    """Paired cluster bootstrap 95% interval of the mean delta (pp). Resamples clusters, never trials."""
    clusters = list(deltas_by_cluster.values())
    if len(clusters) < BOOTSTRAP_MIN_CLUSTERS:
        return None
    rng = random.Random(17)
    estimates = sorted(
        100 * statistics.mean(d for cluster in rng.choices(clusters, k=len(clusters)) for d in cluster) for _ in range(draws)
    )
    return [estimates[int(draws * 0.025)], estimates[int(draws * 0.975) - 1]]


def paired_comparison(records: list[dict], baseline: str, treatment: str) -> dict:
    """Task-weighted paired uplift of treatment over baseline, withheld while anything is unresolved."""
    result = {
        "baseline": baseline,
        "treatment": treatment,
        "task_results": [],
        "uplift_percentage_points": None,
        "bootstrap_95_ci_pp": None,
        "unpaired_tasks": [],
        "unresolved_tasks": [],
    }
    paired: dict[str, dict[str, list]] = defaultdict(lambda: defaultdict(list))
    for record in records:
        if record["arm"] in (baseline, treatment):
            paired[record["task"]][record["arm"]].append(record)
    deltas_by_cluster: dict[str, list[float]] = defaultdict(list)
    for task, arms in sorted(paired.items()):
        a, b = arms.get(baseline, []), arms.get(treatment, [])
        if not a or not b or {(r["trial"], r["epoch"]) for r in a} != {(r["trial"], r["epoch"]) for r in b}:
            result["unpaired_tasks"].append(task)
            continue
        if any(is_unresolved(r) for r in a + b):
            result["unresolved_tasks"].append(task)
            continue
        pa = statistics.mean(record_outcome(r) == "pass" for r in a)
        pb = statistics.mean(record_outcome(r) == "pass" for r in b)
        result["task_results"].append({"task": task, baseline: pa, treatment: pb, "delta_pp": 100 * (pb - pa)})
        deltas_by_cluster[a[0]["cluster"]].append(pb - pa)
    result["independent_request_clusters"] = len(deltas_by_cluster)
    if result["unpaired_tasks"] or result["unresolved_tasks"] or not result["task_results"]:
        result["status"] = "PROVISIONAL: unresolved judgments, execution errors or incomplete pairing; no uplift published."
        return result
    deltas = [r["delta_pp"] for r in result["task_results"]]
    result["status"] = "Automatically graded, with supplied human overrides; validity still depends on rubric/judge calibration."
    result["uplift_percentage_points"] = statistics.mean(deltas)
    result["regressed_tasks"] = [r["task"] for r in result["task_results"] if r["delta_pp"] < 0]
    result["improved_tasks"] = [r["task"] for r in result["task_results"] if r["delta_pp"] > 0]
    pp_by_cluster = {c: [100 * d for d in ds] for c, ds in deltas_by_cluster.items()}
    result["clustered"] = clustered_standard_error(pp_by_cluster)
    result["mde"] = minimum_detectable_effect(result["clustered"]["cluster_sd_pp"], result["clustered"]["clusters"])
    result["bootstrap_95_ci_pp"] = cluster_bootstrap(deltas_by_cluster)
    return result


def summarize(records: list[dict], arms: list[str] | None = None) -> dict:
    """Per-arm absolute signals plus pairwise comparisons of every later arm against the first."""
    arms = arms or sorted({r["arm"] for r in records})
    result = {
        "arms": {arm: arm_summary([r for r in records if r["arm"] == arm]) for arm in arms},
        "comparisons": {},
        "unresolved": {
            "review": sum(record_outcome(r) == "review" for r in records),
            "execution_error": sum(record_outcome(r) == "execution_error" for r in records),
            "no_artifact": sum(r.get("failure_reason") == "no-artifact" for r in records),
        },
        "independent_request_clusters": len({r["cluster"] for r in records}),
    }
    for treatment in arms[1:]:
        result["comparisons"][treatment] = paired_comparison(records, arms[0], treatment)
    blocked = any(is_unresolved(r) for r in records) or any(c["uplift_percentage_points"] is None for c in result["comparisons"].values())
    # Gates read this flag, never the human-facing status text.
    result["blocked"] = blocked
    if len(arms) == 1:
        result["status"] = (
            "Single arm: absolute pass fractions only, no uplift. "
            + ("Unresolved items remain; treat every number as provisional." if blocked else "All items resolved.")
        )
    else:
        result["status"] = (
            "PROVISIONAL: unresolved judgments, execution errors or incomplete pairing; no uplift published."
            if blocked
            else "Automatically graded, with supplied human overrides; validity still depends on rubric/judge calibration."
        )
    return result


def cohen_kappa(pairs: list[tuple[str, str]]) -> float | None:
    """Agreement between two raters beyond chance over paired labels. None below two pairs."""
    if len(pairs) < 2:
        return None
    n = len(pairs)
    agree = sum(a == b for a, b in pairs) / n
    left, right = Counter(a for a, _ in pairs), Counter(b for _, b in pairs)
    expected = sum(left[label] * right[label] for label in set(left) | set(right)) / (n * n)
    if expected == 1:
        return 1.0
    return (agree - expected) / (1 - expected)
