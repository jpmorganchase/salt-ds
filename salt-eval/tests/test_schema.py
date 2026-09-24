import copy

import pytest

from salt_eval import schema


def test_example_case_is_valid(readonly_case):
    assert schema.problems("case", readonly_case) == []


def test_missing_check_parameter_names_the_parameter(readonly_case):
    case = copy.deepcopy(readonly_case)
    case["criteria"].append(
        {"id": "owner", "grader": "jsx:prop-value", "severity": "mandatory", "params": {"element": "FormField", "prop": "readOnly"}}
    )
    assert schema.problems("case", case) == ["/criteria/3/params: 'equals' is a required property"]


def test_unknown_grader_lists_the_valid_kinds(readonly_case):
    case = copy.deepcopy(readonly_case)
    case["criteria"] = [{"id": "x", "grader": "jsx:nope", "severity": "mandatory"}]
    [problem] = schema.problems("case", case)
    assert problem.startswith("/criteria/0/grader: 'jsx:nope' is not one of ['ts:typecheck', 'lint:biome'")


def test_judge_criterion_needs_a_source(readonly_case):
    case = copy.deepcopy(readonly_case)
    case["criteria"][0]["source_ids"] = []
    assert schema.problems("case", case) == ["/criteria/0/source_ids: [] should be non-empty"]


def test_unknown_top_level_field_is_rejected(readonly_case):
    case = copy.deepcopy(readonly_case)
    case["score"] = 1
    assert schema.problems("case", case) == ["/: Additional properties are not allowed ('score' was unexpected)"]


def test_profile_discriminates_on_transport():
    profile = {"id": "p", "revision": "r", "knowledge_revision": "k", "mcp_servers": [{"name": "salt", "transport": "http"}]}
    assert schema.problems("profile", profile) == ["/mcp_servers/0: 'url_env' is a required property"]


def test_grader_request_rejects_path_traversal():
    request = {"id": "1", "files": {"../escape.tsx": "x"}, "checks": []}
    [problem] = schema.problems("grader-request", request)
    assert problem.startswith("/files: '../escape.tsx' does not match")


def test_validate_raises_with_source():
    with pytest.raises(schema.SchemaError) as excinfo:
        schema.validate("suite", {"id": "x"}, "suite.json")
    assert excinfo.value.source == "suite.json"
    assert "/: 'revision' is a required property" in excinfo.value.problems
