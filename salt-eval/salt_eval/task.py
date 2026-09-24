"""The Inspect task: one arm, one trial, one track. The planner never sees the rubric."""

import json

from inspect_ai import Task, task
from inspect_ai.agent import react
from inspect_ai.dataset import Sample
from inspect_ai.model import GenerateConfig, get_model
from inspect_ai.scorer import Score, Target, mean, scorer
from inspect_ai.solver import TaskState

from ._util import digest
from .graders import GraderError, shared_daemon, to_rows
from .judge import JUDGE_PROMPT_SHA256, judge_response, outcome, unresolved_rows
from .profiles import build_tools, load_profile, system_prompt_suffix
from .suites import DEFAULT_FIXTURE, deterministic_criteria, judge_criteria, load_suite, runnable_cases
from .tracks import TRACKS

DEFAULT_MAX_TOKENS = 2500
DEFAULT_MESSAGE_LIMIT = 24


def sample_input(case: dict) -> str:
    repo_state = case.get("context", {}).get("repo_state")
    return f"{case['request']}\n\nContext: {repo_state}" if repo_state else case["request"]


def samples_for(cases: list[dict]) -> list[Sample]:
    """One sample per request plus one per paraphrase; paraphrases share the case's cluster."""
    result = []
    for case in cases:
        result.append(Sample(id=case["id"], input=sample_input(case), metadata={"case": case, "variant": 0}))
        for index, paraphrase in enumerate(case.get("paraphrases", []), start=1):
            variant = dict(case, request=paraphrase)
            result.append(
                Sample(id=f"{case['id']}#p{index}", input=sample_input(variant), metadata={"case": case, "variant": index})
            )
    return result


def no_artifact_rows(criteria: list[dict]) -> list[dict]:
    return [
        {
            "id": c["id"],
            "verdict": "missing",
            "quotes": [],
            "source_ids": [],
            "reason": "no-artifact: the response did not contain exactly one fenced tsx block or one json files manifest",
            "severity": c["severity"],
        }
        for c in criteria
    ]


@scorer(metrics=[mean()])
def salt_rubric(salt_types: str = "src"):
    async def score(state: TaskState, target: Target) -> Score:
        case = state.metadata["case"]
        track = TRACKS[case["track"]]
        completion = state.output.completion
        checks, judged = deterministic_criteria(case), judge_criteria(case)
        files = track.artifact(completion)
        meta: dict = {"artifact": files, "failure_reason": None, "judge_prompt_sha256": JUDGE_PROMPT_SHA256}
        if files is None:
            rows = no_artifact_rows(case["criteria"])
            meta["failure_reason"] = "no-artifact"
        else:
            by_id: dict[str, dict] = {}
            if checks:
                fixture = case.get("context", {}).get("fixture", DEFAULT_FIXTURE)
                try:
                    results = await shared_daemon(salt_types).grade_async(files, checks, fixture)
                    by_id.update({r["id"]: r for r in to_rows(results, checks)})
                except GraderError as exc:
                    by_id.update({r["id"]: r for r in unresolved_rows(checks, f"grader unavailable (harness fault): {exc}")})
            if judged:
                result = await judge_response(judged, case, completion, get_model(role="grader", required=True))
                meta.update(
                    raw_judgment=result["raw_judgment"],
                    validation_error=result["validation_error"],
                    judge_model=result["judge_model"],
                )
                by_id.update({r["id"]: r for r in result["criteria"]})
            rows = [by_id[c["id"]] for c in case["criteria"]]
        status = outcome(rows)
        meta.update(criteria=rows, outcome=status)
        # A review is not a demonstrated pass; the report withholds uplift until every review is resolved.
        return Score(value=int(status == "pass"), answer=status, explanation=json.dumps(rows), metadata=meta)

    return score


@task
def salt_task(
    suite: str,
    profile: str,
    arm: str = "A",
    trial: int = 1,
    track: str = "instruct",
    include_held_out: bool = False,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    message_limit: int = DEFAULT_MESSAGE_LIMIT,
    time_limit: int | None = None,
    salt_types: str = "src",
) -> Task:
    loaded = load_suite(suite)
    arm_profile = load_profile(profile)
    track_spec = TRACKS[track]
    cases = [c for c in runnable_cases(loaded, include_held_out) if c["track"] == track]
    suffix, bundle = system_prompt_suffix(arm_profile)
    prompt = track_spec.planner_prompt + ("\n\n" + suffix if suffix else "")
    config = GenerateConfig(max_tokens=max_tokens, cache=False)
    return Task(
        dataset=samples_for(cases),
        solver=react(prompt=prompt, tools=build_tools(arm_profile), submit=False),
        scorer=salt_rubric(salt_types),
        config=config,
        message_limit=message_limit,
        time_limit=time_limit or track_spec.time_limit,
        name=f"salt-{track}-{arm}-t{trial}",
        metadata={
            "arm": arm,
            "trial": trial,
            "track": track,
            "profile_id": arm_profile.id,
            "profile_sha256": arm_profile.sha256,
            "mcp_revision": arm_profile.data["revision"],
            "knowledge_revision": arm_profile.data["knowledge_revision"],
            "context_bundle": bundle,
            "suite_id": loaded.id,
            "suite_revision": loaded.manifest["revision"],
            "suite_sha256": digest(loaded.snapshot()),
            # The track prompt must match across arms; the full system prompt differs by profile on purpose.
            "planner_prompt_sha256": track_spec.prompt_sha256,
            "system_prompt_sha256": digest(prompt),
            "judge_prompt_sha256": JUDGE_PROMPT_SHA256,
            "generate_config": config.model_dump(exclude_none=True),
        },
    )
