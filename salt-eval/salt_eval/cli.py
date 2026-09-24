"""salt-eval command line. Thin: parse, call one function, print, exit code."""

import argparse
import asyncio
import json
from pathlib import Path
import sys

from inspect_ai.model import get_model

from . import calibrate as calibrate_mod
from . import run as run_mod
from .graders import GraderDaemon, GraderError, shared_daemon, to_rows
from .judge import outcome
from .report import build_report, gate_failures, write_report
from .review import QUEUE_FILE, apply_reviews, export_queue, failed_criteria_without_attribution
from .records import records_from_logs
from .schema import SchemaError
from .suites import DEFAULT_FIXTURE, deterministic_criteria, discover_suites, load_suite, scaffold_case, suite_problems
from .task import DEFAULT_MAX_TOKENS, DEFAULT_MESSAGE_LIMIT


def solve_problems(suite, daemon: GraderDaemon) -> list[str]:
    """Grade every code case's reference solution; a case is solvable when all mandatory checks are correct."""
    found = []
    for case in suite.cases:
        if case["track"] != "code" or case["status"] == "retired":
            continue
        files = suite.solution_files(case)
        where = f"solutions/{case['id']}"
        if not files:
            found.append(f"{where}: no reference solution; every code case needs one to prove it is solvable")
            continue
        checks = deterministic_criteria(case)
        try:
            rows = to_rows(daemon.grade(files, checks, case.get("context", {}).get("fixture", DEFAULT_FIXTURE)), checks)
        except GraderError as exc:
            found.append(f"{where}: grader failed: {exc}")
            continue
        for row in rows:
            if row["severity"] == "mandatory" and row["verdict"] != "correct":
                found.append(f"{where}: {row['id']} is {row['verdict']}: {row['reason']}")
        if outcome(rows) != "pass":
            found.append(f"{where}: reference solution does not pass its own mandatory deterministic criteria")
    return found


def cmd_validate(args) -> int:
    roots = []
    for spec in args.suite or [None]:
        roots.extend(discover_suites(spec))
    if not roots:
        print("No suites found", file=sys.stderr)
        return 1
    failures = 0
    daemon = shared_daemon(args.salt_types) if args.solve else None
    for root in roots:
        try:
            suite = load_suite(root)
        except SchemaError as exc:
            failures += 1
            print(f"FAIL {root}")
            for problem in exc.problems:
                print(f"  {exc.source}: {problem}")
            continue
        problems = suite_problems(suite)
        if daemon:
            problems += solve_problems(suite, daemon)
        status = "FAIL" if problems else "ok"
        failures += bool(problems)
        print(f"{status} {suite.id} ({len(suite.cases)} cases) {root}")
        for problem in problems:
            print(f"  {problem}")
    return 1 if failures else 0


def cmd_new_case(args) -> int:
    roots = discover_suites(args.suite)
    if len(roots) != 1:
        print(f"--suite must resolve to one suite, got {roots}", file=sys.stderr)
        return 1
    suite = load_suite(roots[0])
    try:
        written = scaffold_case(suite, args.id, args.track)
    except FileExistsError as exc:
        print(exc, file=sys.stderr)
        return 1
    for path in written:
        print(path)
    print("Fill in every TODO, then run: salt-eval validate", "--solve" if args.track == "code" else "")
    return 0


def cmd_run(args) -> int:
    try:
        suite, arms, manifest = run_mod.plan(args)
    except (run_mod.RunError, SchemaError, FileNotFoundError) as exc:
        print(exc, file=sys.stderr)
        return 2
    if args.dry_run:
        print(json.dumps(manifest, indent=2))
        return 0
    if not args.out:
        print("--out is required", file=sys.stderr)
        return 2
    try:
        out = run_mod.execute(args, suite, arms, manifest)
    except (run_mod.RunError, FileExistsError, GraderError) as exc:
        print(exc, file=sys.stderr)
        return 2
    print(f"Run complete. Next: salt-eval report --run {out}")
    return 0


def cmd_report(args) -> int:
    report = write_report(Path(args.run), args.reviews)
    print(json.dumps({k: v for k, v in report.items() if k != "records"}, indent=2))
    print(f"\nWrote {Path(args.run) / 'report.json'} and report.md", file=sys.stderr)
    return 0


def cmd_review(args) -> int:
    run_dir = Path(args.run)
    records = records_from_logs(run_dir / "logs")
    queue = export_queue(records, run_dir / QUEUE_FILE)
    audit = apply_reviews(records, args.reviews)
    result = {
        "queue": str(run_dir / QUEUE_FILE),
        "queue_items": len(queue),
        "audit": audit,
        "failed_mandatory_criteria_without_attribution": failed_criteria_without_attribution(records),
    }
    (run_dir / "review-audit.json").write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))
    return 0


def cmd_gate(args) -> int:
    report = build_report(Path(args.run), args.reviews)
    failures = gate_failures(report, args.min_uplift, args.allow_regressions)
    for failure in failures:
        print(f"GATE FAIL: {failure}")
    if not failures:
        print("GATE PASS")
    return 1 if failures else 0


def cmd_calibrate(args) -> int:
    roots = discover_suites(args.suite)
    if len(roots) != 1:
        print(f"--suite must resolve to one suite, got {roots}", file=sys.stderr)
        return 1
    suite = load_suite(roots[0])
    result = asyncio.run(calibrate_mod.calibrate_suite(suite, get_model(args.judge)))
    result["judge"] = args.judge
    if args.out:
        Path(args.out).write_text(json.dumps(result, indent=2))
    print(json.dumps({k: v for k, v in result.items() if k != "cases"}, indent=2))
    return 1 if result["failures"] else 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="salt-eval", description="Paired evaluation of Salt AI tooling with Inspect AI.")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("validate", help="Schema and cross-file checks for suites; --solve grades reference solutions.")
    p.add_argument("suite", nargs="*", help="Suite ids or directories. Default: every mounted suite.")
    p.add_argument("--solve", action="store_true", help="Also grade solutions/<case>/ with the deterministic graders.")
    p.add_argument("--salt-types", choices=["src", "dist"], default="src")
    p.set_defaults(func=cmd_validate)

    p = sub.add_parser("new-case", help="Scaffold a schema-valid draft case.")
    p.add_argument("--suite", required=True)
    p.add_argument("--id", required=True, help="Case id, kebab-case.")
    p.add_argument("--track", choices=["instruct", "code"], required=True)
    p.set_defaults(func=cmd_new_case)

    p = sub.add_parser("run", help="Run every arm on the suite for N trials.")
    p.add_argument("--suite", required=True, help="Suite id or directory.")
    p.add_argument("--arm", action="append", required=True, metavar="NAME=PROFILE", help="Repeatable. The first arm is the baseline.")
    p.add_argument("--model", help="Inspect model id for the planner.")
    p.add_argument("--judge", help="Inspect model id for the judge (required when the suite has judge criteria).")
    p.add_argument("--trials", type=int, default=3)
    p.add_argument("--out", help="New run directory. Required unless --dry-run.")
    p.add_argument("--seed", type=int, default=73, help="Scheduling seed, not a model determinism guarantee.")
    p.add_argument("--allow-knowledge-change", action="store_true", help="Compare whole solutions; do not attribute uplift to delivery alone.")
    p.add_argument("--include-held-out", action="store_true")
    p.add_argument("--max-tokens", type=int, default=DEFAULT_MAX_TOKENS)
    p.add_argument("--message-limit", type=int, default=DEFAULT_MESSAGE_LIMIT)
    p.add_argument("--time-limit", type=int, help="Seconds per sample; default per track (instruct 180, code 300).")
    p.add_argument("--max-connections", type=int)
    p.add_argument("--max-retries", type=int)
    p.add_argument("--max-samples", type=int, default=1, help="Concurrent samples. Keep 1 when a remote server holds conversational state.")
    p.add_argument("--salt-types", choices=["src", "dist"], default="src", help="Typecheck generated code against packages/*/src or built dist-types.")
    p.add_argument("--display", choices=["full", "conversation", "rich", "plain", "log", "none"], default="plain")
    p.add_argument("--dry-run", action="store_true", help="Validate everything and print the manifest without calling a model.")
    p.add_argument("--resume", action="store_true", help="Continue an interrupted run in --out; completed (arm, trial, track) items are skipped.")
    p.add_argument(
        "--skip-mcp-preflight",
        action="store_true",
        help="Do not connect to each arm's MCP servers and list their tools before scheduling. Default: connect, record the tool names in the manifest, and stop if a server is unreachable.",
    )
    p.set_defaults(func=cmd_run)

    p = sub.add_parser("report", help="Write report.json and report.md, exporting the blinded review queue on first use.")
    p.add_argument("--run", required=True)
    p.add_argument("--reviews", help="Labelled review file to overlay.")
    p.set_defaults(func=cmd_report)

    p = sub.add_parser("review", help="Export the blinded queue; with --reviews, apply labels and print agreement and attribution.")
    p.add_argument("--run", required=True)
    p.add_argument("--reviews")
    p.set_defaults(func=cmd_review)

    p = sub.add_parser("gate", help="Exit non-zero on unresolved items, regressions or uplift below --min-uplift.")
    p.add_argument("--run", required=True)
    p.add_argument("--reviews")
    p.add_argument("--min-uplift", type=float, help="Percentage points the first treatment must beat the baseline by.")
    p.add_argument("--allow-regressions", action="store_true")
    p.set_defaults(func=cmd_gate)

    p = sub.add_parser("calibrate", help="Run the judge on maintainer-labelled examples and enforce suite thresholds.")
    p.add_argument("--suite", required=True)
    p.add_argument("--judge", required=True)
    p.add_argument("--out", help="Where to write the full results JSON.")
    p.set_defaults(func=cmd_calibrate)
    return parser


def main(argv=None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        code = args.func(args)
    except (SchemaError, ValueError, FileNotFoundError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        code = 1
    raise SystemExit(code)
