"""Read Inspect logs into flat per-response records. The only module that knows the log layout."""

import copy
from pathlib import Path

from inspect_ai.log import read_eval_log

SCORER = "salt_rubric"

CONSTANT_FIELDS = ("suite_sha256", "judge_prompt_sha256", "planner_model", "judge_model")


def guard_metrics(sample) -> dict:
    usage = list((sample.model_usage or {}).values())
    tool_calls = sum(len(m.tool_calls or []) for m in sample.messages if m.role == "assistant")
    costs = [u.total_cost for u in usage if u.total_cost is not None]
    return {
        "input_tokens": sum(u.input_tokens for u in usage),
        "output_tokens": sum(u.output_tokens for u in usage),
        "total_tokens": sum(u.total_tokens for u in usage),
        "tool_calls": tool_calls,
        "messages": len(sample.messages),
        "total_time_s": sample.total_time,
        "working_time_s": sample.working_time,
        "cost_usd": sum(costs) if costs else None,
    }


def records_from_logs(log_dir: Path | str) -> list[dict]:
    records, seen = [], set()
    for path in sorted(Path(log_dir).glob("*.eval")):
        log = read_eval_log(str(path))
        meta = log.eval.metadata or {}
        for sample in log.samples or []:
            key = (meta["arm"], meta["trial"], str(sample.id), sample.epoch)
            if key in seen:
                raise ValueError(f"Duplicate trial {key}; keep one scoring version per log directory")
            seen.add(key)
            score = (sample.scores or {}).get(SCORER)
            score_meta = (score.metadata or {}) if score else {}
            case = sample.metadata["case"]
            rows = copy.deepcopy(score_meta.get("criteria", []))
            records.append(
                {
                    "response_id": sample.uuid,
                    "arm": meta["arm"],
                    "trial": meta["trial"],
                    "track": meta.get("track", case["track"]),
                    "epoch": sample.epoch,
                    "task": str(sample.id),
                    "case_id": case["id"],
                    "cluster": case.get("cluster_id", case["id"]),
                    "status": case.get("status", "draft"),
                    "case": case,
                    "response": sample.output.completion if sample.output else "",
                    "artifact": score_meta.get("artifact"),
                    "automatic": rows,
                    "effective": copy.deepcopy(rows),
                    "execution_error": bool(sample.error) or not rows,
                    "error": sample.error.message if sample.error else None,
                    "failure_reason": score_meta.get("failure_reason"),
                    "guard": guard_metrics(sample),
                    "log": str(path),
                    "suite_sha256": meta["suite_sha256"],
                    "planner_prompt_sha256": meta["planner_prompt_sha256"],
                    "profile_sha256": meta.get("profile_sha256"),
                    "judge_prompt_sha256": score_meta.get("judge_prompt_sha256", meta["judge_prompt_sha256"]),
                    "judge_model": score_meta.get("judge_model"),
                    "planner_model": log.eval.model,
                }
            )
    if not records:
        raise ValueError("No evaluated samples found")
    return records


def compatibility_problems(records: list[dict]) -> list[str]:
    """Records from different experiments must never be summarised together."""
    found = []
    for field in CONSTANT_FIELDS:
        values = {r.get(field) for r in records if r.get(field) is not None}
        if len(values) > 1:
            found.append(f"different {field}: {sorted(map(str, values))}")
    for track in sorted({r["track"] for r in records}):
        values = {r["planner_prompt_sha256"] for r in records if r["track"] == track}
        if len(values) > 1:
            found.append(f"different planner prompt within track {track}")
    for arm in sorted({r["arm"] for r in records}):
        values = {r.get("profile_sha256") for r in records if r["arm"] == arm}
        if len(values) > 1:
            found.append(f"arm {arm} mixes different profiles")
    return found
