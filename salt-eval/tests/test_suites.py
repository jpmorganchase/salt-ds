import json

import pytest

from salt_eval.schema import SchemaError
from salt_eval.suites import discover_suites, load_suite, runnable_cases, scaffold_case, suite_problems

from .conftest import EXAMPLE_SUITE, copy_suite


def test_example_suite_has_no_problems(example_suite):
    assert suite_problems(example_suite) == []
    assert [c["id"] for c in example_suite.cases] == ["salt-readonly-001", "salt-readonly-code-001"]


def test_canary_mismatch_is_reported(tmp_path):
    root = copy_suite(tmp_path)
    path = root / "cases" / "salt-readonly-001.json"
    case = json.loads(path.read_text())
    case["canary"] = "SALT-EVAL-CANARY-other"
    path.write_text(json.dumps(case))
    assert "cases/salt-readonly-001.json: canary differs from suite.json" in suite_problems(load_suite(root))


def test_held_out_paraphrase_of_a_development_case_is_rejected(tmp_path):
    root = copy_suite(tmp_path)
    source = json.loads((root / "cases" / "salt-readonly-001.json").read_text())
    twin = dict(source, id="salt-readonly-002", status="held_out")
    (root / "cases" / "salt-readonly-002.json").write_text(json.dumps(twin))
    problems = suite_problems(load_suite(root))
    assert any(p.startswith("cluster 'readonly-client-reference' mixes held_out") for p in problems)


def test_held_out_cases_are_excluded_by_default(tmp_path):
    root = copy_suite(tmp_path)
    source = json.loads((root / "cases" / "salt-readonly-001.json").read_text())
    hidden = dict(source, id="salt-hidden-001", cluster_id="hidden", status="held_out")
    (root / "cases" / "salt-hidden-001.json").write_text(json.dumps(hidden))
    suite = load_suite(root)
    assert [c["id"] for c in runnable_cases(suite)] == ["salt-readonly-001", "salt-readonly-code-001"]
    assert "salt-hidden-001" in [c["id"] for c in runnable_cases(suite, include_held_out=True)]


def test_approved_case_needs_an_approver(tmp_path):
    root = copy_suite(tmp_path)
    path = root / "cases" / "salt-readonly-001.json"
    case = json.loads(path.read_text())
    case["status"] = "approved"
    path.write_text(json.dumps(case))
    assert "cases/salt-readonly-001.json: approved cases need provenance.approved_by" in suite_problems(load_suite(root))


def test_calibration_labels_must_cover_every_judge_criterion(tmp_path):
    root = copy_suite(tmp_path)
    path = root / "calibration" / "salt-readonly-001.json"
    data = json.loads(path.read_text())
    del data["examples"][0]["expected"]["state-owner"]
    path.write_text(json.dumps(data))
    [problem] = suite_problems(load_suite(root))
    assert problem == "cases/salt-readonly-001.json: calibration example supported labels ['state-choice'] but the judge criteria are ['state-choice', 'state-owner']"


def test_instruct_case_cannot_use_code_graders(tmp_path):
    root = copy_suite(tmp_path)
    path = root / "cases" / "salt-readonly-001.json"
    case = json.loads(path.read_text())
    case["criteria"].append({"id": "compiles", "grader": "ts:typecheck", "severity": "mandatory"})
    path.write_text(json.dumps(case))
    problems = suite_problems(load_suite(root))
    assert any("uses ts:typecheck, which needs code files" in p for p in problems)


def test_invalid_case_file_fails_loading(tmp_path):
    root = copy_suite(tmp_path)
    (root / "cases" / "broken.json").write_text("{}")
    with pytest.raises(SchemaError) as excinfo:
        load_suite(root)
    assert excinfo.value.source.endswith("cases/broken.json")


def test_scaffold_instruct_and_code_cases_validate(tmp_path):
    root = copy_suite(tmp_path)
    suite = load_suite(root)
    written = scaffold_case(suite, "new-instruct-001", "instruct")
    written += scaffold_case(suite, "new-code-001", "code")
    assert [p.relative_to(root).as_posix() for p in written] == [
        "cases/new-instruct-001.json",
        "calibration/new-instruct-001.json",
        "cases/new-code-001.json",
        "solutions/new-code-001/src/Solution.tsx",
    ]
    reloaded = load_suite(root)
    assert {c["id"] for c in reloaded.cases} >= {"new-instruct-001", "new-code-001"}
    assert suite_problems(reloaded) == []
    with pytest.raises(FileExistsError):
        scaffold_case(reloaded, "new-code-001", "code")


def test_private_suites_mount_through_the_environment(tmp_path, monkeypatch):
    private_root = tmp_path / "private"
    copy_suite(private_root)
    monkeypatch.setenv("SALT_EVAL_SUITES", str(private_root))
    found = discover_suites(None)
    assert EXAMPLE_SUITE.resolve() in found
    assert (private_root / "salt-core-v1").resolve() in found
    assert discover_suites(str(private_root / "salt-core-v1")) == [(private_root / "salt-core-v1").resolve()]
    with pytest.raises(FileNotFoundError):
        discover_suites("no-such-suite")
