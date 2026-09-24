"""Plan and execute a frozen experiment: N arms, T trials, every track in the suite.

The schedule randomises arm order within each trial and shuffles samples identically
across arms. The manifest written first is what `report` reconciles against, so a run
that dies half-way is visible as missing trials rather than a silently smaller sample.
"""

import importlib.metadata
import json
from pathlib import Path
import random

from inspect_ai import eval as inspect_eval
from inspect_ai.log import list_eval_logs, read_eval_log

from ._util import digest, utc_now
from .graders import shared_daemon
from .judge import JUDGE_PROMPT_SHA256
from .profiles import (
    Profile,
    ProfileError,
    load_profile,
    mcp_inventory,
    missing_environment,
    missing_files,
    system_prompt_suffix,
)
from .suites import (
    Suite,
    deterministic_criteria,
    discover_suites,
    judge_criteria,
    load_suite,
    runnable_cases,
    suite_problems,
)
from .task import DEFAULT_MAX_TOKENS, DEFAULT_MESSAGE_LIMIT, salt_task
from .tracks import TRACKS

MANIFEST_VERSION = 1


class RunError(ValueError):
    """The run cannot start safely. Message says what to fix."""


def parse_arm(spec: str) -> tuple[str, Path]:
    name, sep, path = spec.partition("=")
    if not sep or not name.strip() or not path.strip():
        raise RunError(f"--arm expects NAME=path/to/profile.json, got {spec!r}")
    if "/" in name or name != name.strip():
        raise RunError(f"arm name {name!r} may not contain slashes or surrounding spaces")
    return name, Path(path).expanduser().resolve()


def preflight(suite: Suite, arms: dict[str, Profile], allow_knowledge_change: bool, include_held_out: bool) -> list[str]:
    """Everything that can be checked before spending a model call."""
    found = [f"suite {suite.id}: {p}" for p in suite_problems(suite)]
    cases = runnable_cases(suite, include_held_out)
    if not cases:
        found.append(f"suite {suite.id} has no runnable cases")
    first = next(iter(arms.values()))
    for name, profile in arms.items():
        for env in missing_environment(profile):
            found.append(f"arm {name}: environment variable {env} is not set")
        for path in missing_files(profile):
            found.append(f"arm {name}: system prompt file {path} does not exist")
        if profile.data["knowledge_revision"] != first.data["knowledge_revision"] and not allow_knowledge_change:
            found.append(
                f"arm {name}: knowledge_revision differs from the first arm; align them or pass --allow-knowledge-change to compare whole solutions"
            )
    return found


def build_manifest(args: dict, suite: Suite, arms: dict[str, Profile], seed: int, trials: int, include_held_out: bool) -> dict:
    cases = runnable_cases(suite, include_held_out)
    tracks = [t for t in TRACKS if any(c["track"] == t for c in cases)]
    rng = random.Random(seed)
    schedule = []
    for trial in range(1, trials + 1):
        order = list(arms)
        rng.shuffle(order)
        for arm in order:
            for track in tracks:
                schedule.append({"trial": trial, "arm": arm, "track": track})
    arm_info = {}
    for name, profile in arms.items():
        _, bundle = system_prompt_suffix(profile)
        arm_info[name] = {
            "path": str(profile.path),
            "id": profile.id,
            "revision": profile.data["revision"],
            "knowledge_revision": profile.data["knowledge_revision"],
            "sha256": profile.sha256,
            "context_bundle": bundle,
        }
    return {
        "version": MANIFEST_VERSION,
        "created_at": utc_now(),
        "inspect_ai_version": importlib.metadata.version("inspect-ai"),
        "arguments": args,
        "suite": {
            "id": suite.id,
            "root": str(suite.root),
            "revision": suite.manifest["revision"],
            "sha256": digest(suite.snapshot()),
            "cases": [
                {
                    "id": c["id"],
                    "track": c["track"],
                    "cluster_id": c["cluster_id"],
                    "status": c["status"],
                    "variants": 1 + len(c.get("paraphrases", [])),
                }
                for c in cases
            ],
        },
        "arms": arm_info,
        "tracks": tracks,
        "schedule": schedule,
        "planner_prompt_sha256": {t: TRACKS[t].prompt_sha256 for t in tracks},
        "judge_prompt_sha256": JUDGE_PROMPT_SHA256,
    }


def expected_sample_keys(manifest: dict) -> set[tuple]:
    """(arm, trial, sample id, epoch) for every sample the schedule promises."""
    keys = set()
    for item in manifest["schedule"]:
        for case in manifest["suite"]["cases"]:
            if case["track"] != item["track"]:
                continue
            keys.add((item["arm"], item["trial"], case["id"], 1))
            for index in range(1, case["variants"]):
                keys.add((item["arm"], item["trial"], f"{case['id']}#p{index}", 1))
    return keys


def completed_items(log_dir: Path) -> set[tuple]:
    done = set()
    if not log_dir.is_dir():
        return done
    for info in list_eval_logs(str(log_dir)):
        log = read_eval_log(info, header_only=True)
        meta = log.eval.metadata or {}
        if log.status == "success" and {"arm", "trial", "track"} <= set(meta):
            done.add((meta["arm"], meta["trial"], meta["track"]))
    return done


def plan(args) -> tuple[Suite, dict[str, Profile], dict]:
    """Load everything, check it, and build the manifest. No model calls."""
    if args.trials < 1:
        raise RunError("--trials must be at least 1")
    arms = {}
    for spec in args.arm:
        name, path = parse_arm(spec)
        if name in arms:
            raise RunError(f"arm {name!r} given twice")
        arms[name] = load_profile(path)
    roots = discover_suites(args.suite)
    if len(roots) != 1:
        raise RunError(f"--suite must name exactly one suite; {args.suite!r} resolved to {len(roots)}")
    suite = load_suite(roots[0])
    found = preflight(suite, arms, args.allow_knowledge_change, args.include_held_out)
    if not args.model:
        found.append("--model is required")
    if not args.judge and any(judge_criteria(c) for c in runnable_cases(suite, args.include_held_out)):
        found.append("--judge is required because the suite has judge criteria")
    if found:
        raise RunError("cannot start:\n  " + "\n  ".join(found))
    # Handshake with every MCP server now, so a wrong path or a dead endpoint is one clear
    # error instead of a run full of execution errors. Still no model call.
    inventories = {}
    if not args.skip_mcp_preflight:
        for name, profile in arms.items():
            try:
                inventories[name] = mcp_inventory(profile)
            except ProfileError as exc:
                raise RunError(f"cannot start:\n  arm {name}: {exc}\n  (pass --skip-mcp-preflight to schedule anyway)") from None
    recorded = {
        k: v if isinstance(v, (str, int, float, bool, list, type(None))) else str(v)
        for k, v in vars(args).items()
        if k not in {"func", "command"}
    }
    manifest = build_manifest(recorded, suite, arms, args.seed, args.trials, args.include_held_out)
    for name, inventory in inventories.items():
        manifest["arms"][name]["mcp_tools"] = inventory
    manifest["limits"] = {
        "max_tokens": args.max_tokens,
        "message_limit": args.message_limit,
        "time_limit": {t: args.time_limit or TRACKS[t].time_limit for t in manifest["tracks"]},
        "max_connections": args.max_connections,
        "max_retries": args.max_retries,
        "max_samples": args.max_samples,
    }
    return suite, arms, manifest


def execute(args, suite: Suite, arms: dict[str, Profile], manifest: dict) -> Path:
    out = Path(args.out)
    manifest_path = out / "manifest.json"
    if args.resume:
        if not manifest_path.exists():
            raise RunError(f"--resume needs an existing {manifest_path}")
        previous = json.loads(manifest_path.read_text())
        if previous["suite"]["sha256"] != manifest["suite"]["sha256"] or previous["arms"] != manifest["arms"]:
            raise RunError(
                "--resume refused: the suite, the profiles or the MCP tool inventory changed since the run started "
                "(resume with the same --skip-mcp-preflight setting as the original run)"
            )
        manifest = previous
    else:
        out.mkdir(parents=True, exist_ok=False)
        manifest_path.write_text(json.dumps(manifest, indent=2))
    needs_graders = any(deterministic_criteria(c) for c in runnable_cases(suite, args.include_held_out))
    if needs_graders:
        shared_daemon(args.salt_types).start()
    done = completed_items(out / "logs") if args.resume else set()
    for item in manifest["schedule"]:
        key = (item["arm"], item["trial"], item["track"])
        if key in done:
            continue
        task = salt_task(
            suite=str(suite.root),
            profile=str(arms[item["arm"]].path),
            arm=item["arm"],
            trial=item["trial"],
            track=item["track"],
            include_held_out=args.include_held_out,
            max_tokens=args.max_tokens,
            message_limit=args.message_limit,
            time_limit=manifest["limits"]["time_limit"][item["track"]],
            salt_types=args.salt_types,
        )
        inspect_eval(
            task,
            model=args.model,
            model_roles={"grader": args.judge},
            log_dir=str(out / "logs"),
            epochs=1,
            sample_shuffle=args.seed + item["trial"],
            max_samples=args.max_samples,
            max_connections=args.max_connections,
            max_retries=args.max_retries,
            fail_on_error=False,
            display=args.display,
        )
    return out


def default_args(**overrides):
    """Argument namespace with the CLI defaults, for callers that bypass argparse (tests, notebooks)."""
    from argparse import Namespace

    values = dict(
        suite=None,
        arm=[],
        model=None,
        judge=None,
        trials=1,
        out=None,
        seed=73,
        allow_knowledge_change=False,
        include_held_out=False,
        max_tokens=DEFAULT_MAX_TOKENS,
        message_limit=DEFAULT_MESSAGE_LIMIT,
        time_limit=None,
        max_connections=None,
        max_retries=None,
        max_samples=1,
        salt_types="src",
        display="plain",
        dry_run=False,
        resume=False,
        skip_mcp_preflight=False,
    )
    values.update(overrides)
    return Namespace(**values)
