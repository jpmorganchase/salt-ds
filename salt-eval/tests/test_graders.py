import pytest

from salt_eval import graders
from salt_eval.graders import GraderDaemon, GraderError, to_rows

CHECKS = [
    {"id": "readonly", "grader": "jsx:prop-value", "severity": "mandatory", "params": {"element": "FormField", "prop": "readOnly", "equals": True}},
    {"id": "no-disabled", "grader": "jsx:prop-absent", "severity": "mandatory", "params": {"element": "FormField", "prop": "disabled"}},
    {"id": "smoke", "grader": "render:smoke", "severity": "advisory"},
]


@pytest.fixture(scope="module")
def daemon(tmp_path_factory):
    instance = GraderDaemon(cache_dir=tmp_path_factory.mktemp("work"))
    yield instance
    instance.close()


def test_daemon_grades_and_maps_error_to_review(daemon):
    files = {"src/A.tsx": 'import { FormField } from "@salt-ds/core";\nexport const A = () => <FormField disabled />;\n'}
    rows = to_rows(daemon.grade(files, CHECKS), CHECKS)
    assert [(r["id"], r["verdict"]) for r in rows] == [("readonly", "wrong"), ("no-disabled", "wrong"), ("smoke", "review")]
    assert rows[0]["reason"] == "<FormField> at src/A.tsx:2 does not set readOnly"
    assert rows[1]["quotes"] == ["<FormField disabled />"]
    assert rows[1]["evidence"] == [{"file": "src/A.tsx", "line": 2, "column": 24, "text": "<FormField disabled />"}]
    assert rows[2]["reason"].startswith("grader error (harness fault, needs review)")
    assert rows[2]["severity"] == "advisory"


def test_daemon_is_reused_across_requests(daemon):
    first = daemon.grade({"src/A.tsx": "export const a = 1;"}, CHECKS[:1])
    pid = daemon.ready_info["pid"]
    second = daemon.grade({"src/A.tsx": 'import { FormField } from "@salt-ds/core";\nexport const A = () => <FormField readOnly />;'}, CHECKS[:1])
    assert first[0]["verdict"] == "wrong"
    assert second[0]["verdict"] == "correct"
    assert daemon.ready_info["pid"] == pid


def test_invalid_request_is_a_grader_error_not_a_verdict(daemon):
    with pytest.raises(GraderError, match="grader request"):
        daemon.grade({"../escape.tsx": ""}, CHECKS[:1])


def test_missing_binary_is_reported_with_a_fix(monkeypatch, tmp_path):
    monkeypatch.setattr(graders, "GRADER_BIN", tmp_path / "missing.mjs")
    with pytest.raises(GraderError, match="run `yarn` at the repository root"):
        GraderDaemon(cache_dir=tmp_path).grade({"src/A.tsx": ""}, CHECKS[:1])
