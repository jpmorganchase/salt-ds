import json

import pytest

from salt_eval.cli import main

from .conftest import EXAMPLE_SUITE, PACKAGE, copy_suite

PROFILES = PACKAGE / "profiles"


def run_cli(argv) -> int:
    with pytest.raises(SystemExit) as excinfo:
        main(argv)
    return excinfo.value.code


def test_validate_example_suite_passes(capsys):
    assert run_cli(["validate", str(EXAMPLE_SUITE)]) == 0
    assert capsys.readouterr().out.startswith("ok salt-core-v1 (2 cases)")


def test_validate_reports_problems_and_fails(tmp_path, capsys):
    root = copy_suite(tmp_path)
    path = root / "cases" / "salt-readonly-001.json"
    case = json.loads(path.read_text())
    case["criteria"][0]["source_ids"] = ["nope"]
    path.write_text(json.dumps(case))
    assert run_cli(["validate", str(root)]) == 1
    out = capsys.readouterr().out
    assert "FAIL salt-core-v1" in out
    assert "cites unknown source_ids ['nope']" in out


def test_new_case_then_validate(tmp_path, capsys):
    root = copy_suite(tmp_path)
    assert run_cli(["new-case", "--suite", str(root), "--id", "dialog-close-001", "--track", "code"]) == 0
    out = capsys.readouterr().out
    assert "cases/dialog-close-001.json" in out and "solutions/dialog-close-001/src/Solution.tsx" in out
    assert run_cli(["validate", str(root)]) == 0
    assert run_cli(["new-case", "--suite", str(root), "--id", "dialog-close-001", "--track", "code"]) == 1


def test_run_dry_run_prints_manifest_without_output_dir(tmp_path, capsys):
    code = run_cli(
        [
            "run",
            "--suite",
            str(EXAMPLE_SUITE),
            "--arm",
            f"A={PROFILES / 'closed-book.json'}",
            "--arm",
            f"B={PROFILES / 'docs-bundle.json'}",
            "--model",
            "mockllm/model",
            "--judge",
            "mockllm/judge",
            "--trials",
            "1",
            "--allow-knowledge-change",
            "--dry-run",
        ]
    )
    assert code == 0
    manifest = json.loads(capsys.readouterr().out)
    assert [(i["arm"], i["track"]) for i in manifest["schedule"]] in (
        [("A", "instruct"), ("A", "code"), ("B", "instruct"), ("B", "code")],
        [("B", "instruct"), ("B", "code"), ("A", "instruct"), ("A", "code")],
    )
    assert manifest["arms"]["B"]["context_bundle"]["files"][0] == "form-field/accessibility.mdx"
    assert not list(tmp_path.iterdir())


def test_run_refuses_unaligned_knowledge(capsys):
    code = run_cli(
        ["run", "--suite", str(EXAMPLE_SUITE), "--arm", f"A={PROFILES / 'closed-book.json'}", "--arm", f"B={PROFILES / 'docs-bundle.json'}", "--model", "m", "--judge", "j", "--dry-run"]
    )
    assert code == 2
    assert "knowledge_revision differs" in capsys.readouterr().err
