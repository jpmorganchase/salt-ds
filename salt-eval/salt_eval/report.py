"""Compose report.json and report.md for a run, and decide whether a gate passes."""

import json
from pathlib import Path

from ._util import utc_now
from .records import compatibility_problems, records_from_logs
from .review import QUEUE_FILE, apply_reviews, export_queue
from .run import expected_sample_keys
from .stats import summarize

PROVISIONAL = "PROVISIONAL"


def build_report(run_dir: Path, reviews_path: Path | str | None = None) -> dict:
    run_dir = Path(run_dir)
    records = records_from_logs(run_dir / "logs")
    problems = compatibility_problems(records)
    if problems:
        raise ValueError("Incompatible experiments in one log directory: " + "; ".join(problems))
    manifest_path = run_dir / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else None
    arms = list(manifest["arms"]) if manifest else sorted({r["arm"] for r in records})
    audit = apply_reviews(records, reviews_path)
    export_queue(records, run_dir / QUEUE_FILE)
    report = {
        "generated_at": utc_now(),
        "run": str(run_dir),
        "suite": manifest["suite"] if manifest else None,
        "arms_order": arms,
        "arm_profiles": manifest["arms"] if manifest else None,
        "models": {
            "planner": records[0]["planner_model"],
            "judge": next((r["judge_model"] for r in records if r.get("judge_model")), None),
        },
        "comparison": summarize(records, arms),
        "by_track": {track: summarize([r for r in records if r["track"] == track], arms) for track in sorted({r["track"] for r in records})},
        "human_review_audit": audit,
        "review_queue": str(run_dir / QUEUE_FILE),
        "missing_or_extra_scheduled_trials": [],
        "records": records,
    }
    if manifest:
        expected = expected_sample_keys(manifest)
        actual = {(r["arm"], r["trial"], r["task"], r["epoch"]) for r in records}
        if actual != expected:
            report["missing_or_extra_scheduled_trials"] = [list(k) for k in sorted(expected ^ actual)]
            for summary in [report["comparison"], *report["by_track"].values()]:
                summary["blocked"] = True
                summary["status"] = f"{PROVISIONAL}: scheduled trial accounting incomplete; no uplift published."
                for comparison in summary["comparisons"].values():
                    comparison["uplift_percentage_points"] = None
                    comparison["bootstrap_95_ci_pp"] = None
                    comparison["status"] = summary["status"]
    report["status"] = report["comparison"]["status"]
    return report


def write_report(run_dir: Path, reviews_path=None) -> dict:
    run_dir = Path(run_dir)
    report = build_report(run_dir, reviews_path)
    (run_dir / "report.json").write_text(json.dumps(report, indent=2))
    (run_dir / "report.md").write_text(render_markdown(report))
    return report


def gate_failures(report: dict, min_uplift: float | None = None, allow_regressions: bool = False) -> list[str]:
    """Reasons a CI or release gate should fail. Empty means pass."""
    found = []
    if report["comparison"]["blocked"] or report["missing_or_extra_scheduled_trials"]:
        found.append("unresolved items: " + json.dumps(report["comparison"]["unresolved"]))
    for arm, summary in report["comparison"]["arms"].items():
        if summary["trials"] == 0:
            found.append(f"arm {arm} has no trials")
    for treatment, comparison in report["comparison"]["comparisons"].items():
        uplift = comparison["uplift_percentage_points"]
        if uplift is None:
            found.append(f"{treatment} vs {comparison['baseline']}: uplift withheld")
            continue
        if not allow_regressions and comparison.get("regressed_tasks"):
            found.append(f"{treatment} regressed tasks: {comparison['regressed_tasks']}")
        if min_uplift is not None and uplift < min_uplift:
            found.append(f"{treatment} uplift {uplift:.1f} pp is below --min-uplift {min_uplift}")
    return found


def _pct(value) -> str:
    return "n/a" if value is None else f"{100 * value:.1f}%"


def _tool_inventory(arm_profile: dict) -> str:
    """Tool names recorded at preflight; 'none' for closed-book arms, 'not checked' when preflight was skipped."""
    inventory = arm_profile.get("mcp_tools")
    if inventory is None:
        return "not checked"
    if not inventory:
        return "none"
    return "; ".join(f"{server}: {', '.join(f'`{t}`' for t in tools)}" for server, tools in inventory.items())


def _num(value, digits=1) -> str:
    return "n/a" if value is None else f"{value:.{digits}f}"


def _table(headers: list[str], rows: list[list[str]]) -> str:
    lines = ["| " + " | ".join(headers) + " |", "|" + "|".join(" --- " for _ in headers) + "|"]
    lines.extend("| " + " | ".join(str(c) for c in row) + " |" for row in rows)
    return "\n".join(lines)


def _arm_table(summary: dict) -> str:
    rows = []
    for arm, s in summary["arms"].items():
        guard = s.get("guard", {})
        rows.append(
            [
                arm,
                s["trials"],
                _pct(s["confirmed_pass_fraction"]),
                _pct(s["avg_at_k"]),
                _pct(s["pass_pow_k"]),
                s["unresolved"],
                s["no_artifact"],
                _num(guard.get("total_tokens", {}).get("mean"), 0),
                _num(guard.get("tool_calls", {}).get("mean"), 1),
                _num(guard.get("total_time_s", {}).get("mean"), 1),
            ]
        )
    return _table(
        ["Arm", "Trials", "Confirmed pass", "avg@k", "pass^k", "Unresolved", "No artifact", "Tokens/trial", "Tool calls/trial", "Seconds/trial"],
        rows,
    )


def _criteria_table(summary: dict) -> str:
    arms = list(summary["arms"])
    ids = sorted({cid for s in summary["arms"].values() for cid in s["criteria"]})
    rows = []
    for cid in ids:
        row = [cid]
        for arm in arms:
            counts = summary["arms"][arm]["criteria"].get(cid, {})
            row.append(" / ".join(str(counts.get(v, 0)) for v in ("correct", "missing", "wrong", "review")))
        rows.append(row)
    return _table(["Criterion", *[f"{a} (correct / missing / wrong / review)" for a in arms]], rows)


def _comparison_section(comparison: dict) -> str:
    base, treat = comparison["baseline"], comparison["treatment"]
    lines = [f"### {treat} vs {base}", "", comparison["status"], ""]
    if comparison["task_results"]:
        lines.append(_table(["Task", base, treat, "Delta (pp)"], [[t["task"], _pct(t[base]), _pct(t[treat]), _num(t["delta_pp"])] for t in comparison["task_results"]]))
        lines.append("")
    if comparison["uplift_percentage_points"] is not None:
        clustered, mde = comparison.get("clustered", {}), comparison.get("mde", {})
        lines.append(f"- Paired uplift: **{comparison['uplift_percentage_points']:.1f} pp** (task-weighted mean of {treat} minus {base}).")
        lines.append(f"- Independent request clusters: {comparison['independent_request_clusters']}.")
        if clustered.get("se_pp") is not None:
            lo, hi = clustered["ci95_pp"]
            lines.append(f"- Clustered standard error: {clustered['se_pp']:.1f} pp; normal 95% interval {lo:.1f} to {hi:.1f} pp.")
        else:
            lines.append("- Clustered standard error: not computable below two clusters.")
        if mde.get("mde_pp") is not None:
            lines.append(f"- Minimum detectable effect at 80% power: {mde['mde_pp']:.1f} pp. Clusters needed for 5 pp: {mde['clusters_for_5pp']}; for 10 pp: {mde['clusters_for_10pp']}.")
        if comparison["bootstrap_95_ci_pp"]:
            lo, hi = comparison["bootstrap_95_ci_pp"]
            lines.append(f"- Paired cluster bootstrap 95% interval: {lo:.1f} to {hi:.1f} pp.")
        else:
            lines.append("- Cluster bootstrap: withheld below ten clusters.")
        lines.append(f"- Regressed tasks: {comparison.get('regressed_tasks') or 'none'}. Improved tasks: {comparison.get('improved_tasks') or 'none'}.")
    else:
        if comparison["unpaired_tasks"]:
            lines.append(f"- Unpaired tasks: {comparison['unpaired_tasks']}")
        if comparison["unresolved_tasks"]:
            lines.append(f"- Tasks with unresolved trials: {comparison['unresolved_tasks']}")
    return "\n".join(lines)


def render_markdown(report: dict) -> str:
    summary = report["comparison"]
    suite = report.get("suite") or {}
    lines = [
        "# salt-eval report",
        "",
        f"Run: `{report['run']}`  ",
        f"Generated: {report['generated_at']}  ",
        f"Suite: {suite.get('id', 'unknown')} (revision {suite.get('revision', '?')})  ",
        f"Planner: `{report['models']['planner']}`; judge: `{report['models']['judge']}`",
        "",
        f"**Status.** {report['status']}",
        "",
    ]
    if report.get("arm_profiles"):
        lines.append(
            _table(
                ["Arm", "Profile", "Tooling revision", "Knowledge revision", "MCP tools exposed"],
                [[a, p["id"], p["revision"], p["knowledge_revision"], _tool_inventory(p)] for a, p in report["arm_profiles"].items()],
            )
        )
        lines.append("")
    lines += ["## Arms", "", _arm_table(summary), "", f"Unresolved overall: {json.dumps(summary['unresolved'])}.", ""]
    lines += ["## Criteria", "", _criteria_table(summary), ""]
    if summary["comparisons"]:
        lines += ["## Paired comparison", ""]
        for comparison in summary["comparisons"].values():
            lines += [_comparison_section(comparison), ""]
    for track, track_summary in report["by_track"].items():
        lines += [f"## Track: {track}", "", _arm_table(track_summary), ""]
        for comparison in track_summary["comparisons"].values():
            lines += [_comparison_section(comparison), ""]
    if report["missing_or_extra_scheduled_trials"]:
        lines += ["## Scheduled trials missing or extra", "", "```json", json.dumps(report["missing_or_extra_scheduled_trials"], indent=2), "```", ""]
    audit = report["human_review_audit"]
    lines += [
        "## Human review",
        "",
        f"Blinded queue: `{report['review_queue']}`. Fill in `reviewer`, verdicts, reasons and attribution, then rerun `salt-eval report --reviews <file>`.",
        "",
        f"- False accept rate: {_pct(audit.get('false_accept_rate'))}; false reject rate: {_pct(audit.get('false_reject_rate'))} (over reviewed labels only).",
        f"- Inter-rater agreement: {json.dumps(audit.get('inter_rater', {}))}.",
        f"- Failure attribution: {json.dumps(audit.get('attribution', {}))}.",
        "",
        "## Reading this",
        "",
        "- A trial passes when every mandatory criterion is `correct`. Advisory criteria are listed but never counted.",
        "- Uplift is withheld while any verdict is `review`, any trial errored, any scheduled trial is missing, or arms are unpaired.",
        "- Model-graded verdicts are labelled as such; their validity depends on `salt-eval calibrate` and the human review above.",
        "- Guard metrics (tokens, tool calls, seconds) are per trial means; a cheaper arm with the same pass rate is a real result too.",
        "",
    ]
    return "\n".join(lines)
