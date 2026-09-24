"""Suite loading, semantic validation, discovery and case scaffolding.

A suite is a directory: suite.json, cases/<id>.json, calibration/<id>.json,
solutions/<id>/... Schema validation happens in schema.py; the rules that span
files (ids, references, calibration coverage, held-out separation) live here.
"""

from dataclasses import dataclass
import json
import os
from pathlib import Path
import uuid

from .schema import PACKAGE_ROOT, SchemaError, load_validated

DEFAULT_SUITES_DIR = PACKAGE_ROOT / "suites"
FIXTURES_DIR = PACKAGE_ROOT / "fixtures"
DEFAULT_FIXTURE = "workspace-vite-react"
SUITES_ENV = "SALT_EVAL_SUITES"

RUNNABLE_STATUSES = {"draft", "approved", "held_out"}
INSTRUCT_GRADERS = {"judge", "text:forbidden-pattern"}


@dataclass(frozen=True)
class Suite:
    root: Path
    manifest: dict
    cases: tuple

    @property
    def id(self) -> str:
        return self.manifest["id"]

    def case(self, case_id: str) -> dict:
        for case in self.cases:
            if case["id"] == case_id:
                return case
        raise KeyError(f"Suite {self.id} has no case {case_id!r}")

    def calibration_path(self, case: dict) -> Path | None:
        rel = case.get("calibration")
        return self.root / rel if rel else None

    def solution_dir(self, case: dict) -> Path:
        return self.root / "solutions" / case["id"]

    def solution_files(self, case: dict) -> dict[str, str]:
        base = self.solution_dir(case)
        if not base.is_dir():
            return {}
        return {
            str(path.relative_to(base)).replace(os.sep, "/"): path.read_text()
            for path in sorted(base.rglob("*"))
            if path.is_file()
        }

    def snapshot(self) -> dict:
        """Everything that defines the suite's content, for hashing into run manifests."""
        return {"manifest": self.manifest, "cases": list(self.cases)}


def load_suite(root: Path | str) -> Suite:
    """Load and schema-validate a suite directory. Raises SchemaError on the first invalid file."""
    root = Path(root).resolve()
    manifest = load_validated("suite", root / "suite.json")
    cases = tuple(
        load_validated("case", path) for path in sorted((root / "cases").glob("*.json"))
    )
    return Suite(root=root, manifest=manifest, cases=cases)


def judge_criteria(case: dict) -> list[dict]:
    return [c for c in case["criteria"] if c["grader"] == "judge"]


def deterministic_criteria(case: dict) -> list[dict]:
    return [c for c in case["criteria"] if c["grader"] != "judge"]


def runnable_cases(suite: Suite, include_held_out: bool = False) -> list[dict]:
    statuses = RUNNABLE_STATUSES if include_held_out else RUNNABLE_STATUSES - {"held_out"}
    return [c for c in suite.cases if c["status"] in statuses]


def suite_problems(suite: Suite) -> list[str]:
    """Cross-file rules a schema cannot express. Empty list means the suite is coherent."""
    found: list[str] = []
    canary = suite.manifest["canary"]
    by_cluster: dict[str, set[str]] = {}
    for case in suite.cases:
        where = f"cases/{case['id']}.json"
        path = suite.root / "cases" / f"{case['id']}.json"
        if not path.exists():
            found.append(f"{where}: file name must equal the case id")
        if case["canary"] != canary:
            found.append(f"{where}: canary differs from suite.json")
        ids = [c["id"] for c in case["criteria"]]
        if len(set(ids)) != len(ids):
            found.append(f"{where}: duplicate criterion ids")
        references = {r["id"] for r in case["references"]}
        for criterion in case["criteria"]:
            unknown = set(criterion.get("source_ids", [])) - references
            if unknown:
                found.append(f"{where}: criterion {criterion['id']} cites unknown source_ids {sorted(unknown)}")
            if case["track"] == "instruct" and criterion["grader"] not in INSTRUCT_GRADERS:
                found.append(
                    f"{where}: criterion {criterion['id']} uses {criterion['grader']}, which needs code files; instruct cases may only use {sorted(INSTRUCT_GRADERS)}"
                )
        mandatory = [c for c in case["criteria"] if c["severity"] == "mandatory"]
        if not mandatory:
            found.append(f"{where}: at least one mandatory criterion is required")
        if case["track"] == "code":
            if not deterministic_criteria(case):
                found.append(f"{where}: code cases need at least one deterministic criterion")
            fixture = case.get("context", {}).get("fixture", DEFAULT_FIXTURE)
            if not (FIXTURES_DIR / fixture / "tsconfig.json").exists():
                found.append(f"{where}: fixture {fixture!r} has no fixtures/{fixture}/tsconfig.json")
        if case["status"] == "approved":
            if not case["provenance"].get("approved_by"):
                found.append(f"{where}: approved cases need provenance.approved_by")
            if case["track"] == "code" and not suite.solution_files(case):
                found.append(f"{where}: approved code cases need a reference solution in solutions/{case['id']}/")
        found.extend(_calibration_problems(suite, case, where))
        by_cluster.setdefault(case["cluster_id"], set()).add(case["status"])
    for cluster, statuses in sorted(by_cluster.items()):
        if "held_out" in statuses and statuses - {"held_out", "retired"}:
            found.append(
                f"cluster {cluster!r} mixes held_out and development cases; paraphrases of a development case cannot be held out"
            )
    return found


def _calibration_problems(suite: Suite, case: dict, where: str) -> list[str]:
    judged = {c["id"] for c in judge_criteria(case)}
    path = suite.calibration_path(case)
    if not judged:
        return [f"{where}: calibration file given but the case has no judge criteria"] if path else []
    if path is None:
        return [f"{where}: cases with judge criteria need a calibration file"]
    if not path.exists():
        return [f"{where}: calibration file {path.relative_to(suite.root)} does not exist"]
    try:
        data = load_validated("calibration", path)
    except SchemaError as exc:
        return [f"{where}: {p}" for p in exc.problems]
    found = []
    if data["case_id"] != case["id"]:
        found.append(f"{where}: calibration case_id {data['case_id']!r} does not match")
    for example in data["examples"]:
        labelled = set(example["expected"])
        if labelled != judged:
            found.append(
                f"{where}: calibration example {example['id']} labels {sorted(labelled)} but the judge criteria are {sorted(judged)}"
            )
    return found


def suite_roots() -> list[Path]:
    """Public suites directory first, then any private roots mounted through SALT_EVAL_SUITES."""
    roots = [DEFAULT_SUITES_DIR]
    for entry in os.environ.get(SUITES_ENV, "").split(os.pathsep):
        if entry:
            roots.append(Path(entry).expanduser().resolve())
    return roots


def discover_suites(spec: str | None) -> list[Path]:
    """Resolve a suite id, a suite directory, or a directory of suites. None means every mounted suite."""
    if spec is None:
        return [child for root in suite_roots() for child in _suite_dirs(root)]
    path = Path(spec).expanduser()
    if (path / "suite.json").is_file():
        return [path.resolve()]
    if path.is_dir():
        dirs = _suite_dirs(path)
        if dirs:
            return dirs
    for root in suite_roots():
        if (root / spec / "suite.json").is_file():
            return [(root / spec).resolve()]
    raise FileNotFoundError(
        f"No suite {spec!r}: not a suite directory and not found under {[str(r) for r in suite_roots()]}"
    )


def _suite_dirs(root: Path) -> list[Path]:
    if not root.is_dir():
        return []
    return sorted(child.resolve() for child in root.iterdir() if (child / "suite.json").is_file())


def new_canary() -> str:
    return f"SALT-EVAL-CANARY-{uuid.uuid4()}"


def scaffold_case(suite: Suite, case_id: str, track: str) -> list[Path]:
    """Write a schema-valid draft case plus its calibration file or solution stub. Never overwrites."""
    case_path = suite.root / "cases" / f"{case_id}.json"
    targets = [case_path]
    if track == "instruct":
        targets.append(suite.root / "calibration" / f"{case_id}.json")
    else:
        targets.append(suite.root / "solutions" / case_id / "src" / "Solution.tsx")
    existing = [p for p in targets if p.exists()]
    if existing:
        raise FileExistsError(f"Refusing to overwrite {[str(p) for p in existing]}")

    case = {
        "id": case_id,
        "track": track,
        "family": "todo-family",
        "cluster_id": case_id,
        "status": "draft",
        "provenance": {"kind": "authored", "source": "TODO: where this request came from"},
        "contamination": "public-stable",
        "salt": suite.manifest["salt"],
        "request": "TODO: the request exactly as a user would write it. Only this text reaches the planner.",
        "references": [
            {
                "id": "todo-reference",
                "url": "https://www.saltdesignsystem.com/salt/components/TODO",
                "reviewed_date": "2000-01-01",
                "kind": "TODO: how the fact was verified (source file, docs page, maintainer); fix reviewed_date",
                "fact": "TODO: the trusted fact the judge grades against",
            }
        ],
        "criteria": [],
        "canary": suite.manifest["canary"],
    }
    judge_criterion = {
        "id": "todo-decision",
        "grader": "judge",
        "severity": "mandatory",
        "requirement": "TODO: the Salt-specific decision the response must make",
        "accept": "TODO: equivalent wordings that pass",
        "wrong": "TODO: explicit conflicting recommendations",
        "missing": "TODO: vague responses that do not resolve the decision",
        "source_ids": ["todo-reference"],
    }
    if track == "instruct":
        case["criteria"] = [judge_criterion]
        case["calibration"] = f"calibration/{case_id}.json"
        calibration = {
            "case_id": case_id,
            "status": "DRAFT labels; a Salt maintainer must approve them",
            "examples": [
                {
                    "id": "supported",
                    "response": "TODO: a response that satisfies every criterion",
                    "expected": {"todo-decision": "correct"},
                },
                {
                    "id": "wrong",
                    "response": "TODO: a response with an explicit conflicting recommendation",
                    "expected": {"todo-decision": "wrong"},
                },
            ],
        }
        targets[1].parent.mkdir(parents=True, exist_ok=True)
        targets[1].write_text(json.dumps(calibration, indent=2) + "\n")
    else:
        case["context"] = {
            "repo_state": "TODO: what the consuming application already has (Salt installed, provider configured, existing components)",
            "fixture": DEFAULT_FIXTURE,
        }
        case["criteria"] = [
            {"id": "compiles", "grader": "ts:typecheck", "severity": "mandatory"},
            {"id": "lints", "grader": "lint:biome", "severity": "mandatory"},
            {"id": "imports-exist", "grader": "salt:imports-resolve", "severity": "mandatory"},
            {
                "id": "todo-composition",
                "grader": "jsx:required-element",
                "severity": "mandatory",
                "requirement": "TODO: the Salt component the solution must render",
                "params": {"element": "TODO", "from": "@salt-ds/core"},
            },
        ]
        targets[1].parent.mkdir(parents=True, exist_ok=True)
        targets[1].write_text(
            'import { TODO } from "@salt-ds/core";\n\nexport function Solution() {\n  return <TODO />;\n}\n'
        )
    case_path.parent.mkdir(parents=True, exist_ok=True)
    case_path.write_text(json.dumps(case, indent=2) + "\n")
    return targets
