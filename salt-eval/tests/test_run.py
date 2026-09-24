from collections import Counter

import pytest

from salt_eval import run

from .conftest import EXAMPLE_SUITE, PACKAGE

PROFILES = PACKAGE / "profiles"


def args(**overrides):
    base = dict(
        suite=str(EXAMPLE_SUITE),
        arm=[f"A={PROFILES / 'closed-book.json'}", f"B={PROFILES / 'docs-bundle.json'}"],
        model="mockllm/model",
        judge="mockllm/judge",
        trials=4,
        allow_knowledge_change=True,
    )
    base.update(overrides)
    return run.default_args(**base)


def test_plan_randomises_arm_order_but_pairs_every_trial():
    _, arms, manifest = run.plan(args())
    assert list(arms) == ["A", "B"]
    assert manifest["tracks"] == ["instruct", "code"]
    per_trial = {}
    for item in manifest["schedule"]:
        per_trial.setdefault(item["trial"], []).append((item["arm"], item["track"]))
    assert all(Counter(items) == Counter([("A", "instruct"), ("A", "code"), ("B", "instruct"), ("B", "code")]) for items in per_trial.values())
    orders = {tuple(dict.fromkeys(arm for arm, _ in items)) for items in per_trial.values()}
    assert orders == {("A", "B"), ("B", "A")}


def test_expected_sample_keys_cover_every_arm_trial_and_case():
    _, _, manifest = run.plan(args(trials=2))
    keys = run.expected_sample_keys(manifest)
    assert keys == {
        ("A", 1, "salt-readonly-001", 1),
        ("A", 2, "salt-readonly-001", 1),
        ("B", 1, "salt-readonly-001", 1),
        ("B", 2, "salt-readonly-001", 1),
        ("A", 1, "salt-readonly-code-001", 1),
        ("A", 2, "salt-readonly-code-001", 1),
        ("B", 1, "salt-readonly-code-001", 1),
        ("B", 2, "salt-readonly-code-001", 1),
    }


def test_knowledge_change_is_refused_by_default():
    with pytest.raises(run.RunError, match="knowledge_revision differs"):
        run.plan(args(allow_knowledge_change=False))


def test_single_arm_plan_has_one_arm_per_trial():
    _, arms, manifest = run.plan(args(arm=[f"only={PROFILES / 'closed-book.json'}"], trials=2))
    assert list(arms) == ["only"]
    assert [(i["trial"], i["arm"]) for i in manifest["schedule"]] == [(1, "only"), (1, "only"), (2, "only"), (2, "only")]


def test_missing_judge_is_caught_before_any_model_call():
    with pytest.raises(run.RunError, match="--judge is required"):
        run.plan(args(judge=None))


def test_missing_environment_is_caught_before_any_model_call(monkeypatch):
    monkeypatch.delenv("SALT_MCP_URL", raising=False)
    with pytest.raises(run.RunError, match="SALT_MCP_URL is not set"):
        run.plan(args(arm=[f"A={PROFILES / 'mcp-http.example.json'}"]))


@pytest.mark.parametrize("spec", ["A", "=x.json", "A/B=x.json", " A=x.json"])
def test_bad_arm_specs_are_rejected(spec):
    with pytest.raises(run.RunError):
        run.parse_arm(spec)
