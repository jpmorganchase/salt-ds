"""Both tracks, single and paired arms, through the real CLI path with mock models and a real stdio MCP fixture.

These prove the plumbing (tool discovery, artifact extraction, deterministic graders,
judge validation, logging, reporting). They say nothing about any model's Salt expertise.
"""

import json
from pathlib import Path
import sys

import pytest
from inspect_ai import eval as inspect_eval
from inspect_ai.model import ChatCompletionChoice, ChatMessageAssistant, ModelOutput, get_model
from inspect_ai.tool import ToolCall

from salt_eval import run
from salt_eval.profiles import ProfileError, load_profile, mcp_inventory
from salt_eval.records import records_from_logs
from salt_eval.report import build_report, gate_failures, write_report
from salt_eval.review import QUEUE_FILE
from salt_eval.stats import record_outcome
from salt_eval.task import salt_task

from .conftest import EXAMPLE_SUITE, PACKAGE, write_json

PROFILES = PACKAGE / "profiles"
SOLUTION = (EXAMPLE_SUITE / "solutions" / "salt-readonly-code-001" / "src" / "ClientReferenceField.tsx").read_text()

INSTRUCT_ANSWER = "Use readOnly on FormField. Keep the existing Input and label; the value stays selectable and copyable."
CODE_ANSWER = f"readOnly goes on FormField so the Input inherits it and the value stays selectable and copyable.\n\n```tsx\n{SOLUTION}```\n"

FIXTURE_SERVER = '''from mcp.server.fastmcp import FastMCP
mcp = FastMCP("fixture")
@mcp.tool()
def salt_reference(query: str) -> str:
    """Look up fixture Salt guidance.

    Args:
        query: Requested guidance.
    """
    return "Apply readOnly to FormField; read-only Input remains copyable."
if __name__ == "__main__":
    mcp.run()
'''


@pytest.fixture(scope="module")
def mcp_profile(tmp_path_factory) -> Path:
    root = tmp_path_factory.mktemp("mcp")
    server = root / "fixture_server.py"
    server.write_text(FIXTURE_SERVER)
    return write_json(
        root / "mcp-fixture.json",
        {
            "id": "mcp-fixture",
            "revision": "fixture",
            "knowledge_revision": "model-training-data",
            "mcp_servers": [{"name": "salt", "transport": "stdio", "command": sys.executable, "args": [str(server)]}],
        },
    )


def planner_model(answers_by_track: dict[str, str | None]):
    """Calls the fixture tool once when one is offered, then answers per track (None means prose only)."""

    def callback(messages, tools, tool_choice, config):
        track = "code" if "fenced ```tsx" in messages[0].text else "instruct"
        lookup = next((t for t in tools if "salt_reference" in t.name), None)
        if lookup and not any(m.role == "tool" for m in messages):
            return ModelOutput(
                model="mockllm/planner",
                choices=[
                    ChatCompletionChoice(
                        message=ChatMessageAssistant(
                            content="", tool_calls=[ToolCall(id="lookup", function=lookup.name, arguments={"query": "read-only"})]
                        ),
                        stop_reason="tool_calls",
                    )
                ],
            )
        answer = answers_by_track[track]
        return ModelOutput.from_content("mockllm/planner", answer if answer is not None else "Use a read-only FormField.")

    return get_model("mockllm/planner", custom_outputs=callback, memoize=False)


def judge_model(seen: list | None = None):
    def callback(messages, tools, tool_choice, config):
        payload = json.loads(messages[-1].text)
        assert "arm" not in payload and "tools" not in payload
        if seen is not None:
            seen.append(payload)
        rows = [
            {"id": c["id"], "verdict": "correct", "quotes": ["readOnly"], "source_ids": c["source_ids"][:1], "reason": "stated"}
            for c in payload["criteria"]
        ]
        return ModelOutput.from_content("mockllm/judge", json.dumps({"criteria": rows}))

    return get_model("mockllm/judge", custom_outputs=callback, memoize=False)


def run_args(out: Path, arms: list[str], trials: int, **overrides):
    values = dict(
        suite=str(EXAMPLE_SUITE),
        arm=arms,
        model=planner_model({"instruct": INSTRUCT_ANSWER, "code": CODE_ANSWER}),
        judge=judge_model(),
        trials=trials,
        out=str(out),
        allow_knowledge_change=True,
        display="none",
    )
    values.update(overrides)
    return run.default_args(**values)


def test_paired_run_reports_uplift_guards_and_blinded_queue(tmp_path, mcp_profile):
    out = tmp_path / "paired"
    args = run_args(out, [f"A={PROFILES / 'closed-book.json'}", f"B={mcp_profile}"], trials=2)
    suite, arms, manifest = run.plan(args)
    run.execute(args, suite, arms, manifest)

    report = write_report(out)
    assert not report["status"].startswith("PROVISIONAL"), report["status"]
    assert report["missing_or_extra_scheduled_trials"] == []
    summary = report["comparison"]
    assert summary["arms"]["A"]["trials"] == 4 and summary["arms"]["B"]["trials"] == 4
    assert summary["arms"]["A"]["confirmed_pass_fraction"] == 1.0
    assert summary["arms"]["B"]["confirmed_pass_fraction"] == 1.0
    assert summary["arms"]["A"]["guard"]["tool_calls"]["mean"] == 0.0
    assert summary["arms"]["B"]["guard"]["tool_calls"]["mean"] == 1.0
    assert summary["arms"]["B"]["guard"]["total_tokens"]["total"] >= 0
    comparison = summary["comparisons"]["B"]
    assert comparison["uplift_percentage_points"] == 0.0
    assert comparison["independent_request_clusters"] == 1
    assert sorted(report["by_track"]) == ["code", "instruct"]
    assert summary["arms"]["A"]["criteria"]["readonly-on-formfield"] == {"correct": 2}
    assert summary["arms"]["A"]["criteria"]["explains-copyable"] == {"correct": 2}

    code_records = [r for r in report["records"] if r["track"] == "code"]
    assert len(code_records) == 4
    assert all(r["artifact"] == {"src/Solution.tsx": SOLUTION} for r in code_records)
    assert all(record_outcome(r) == "pass" for r in report["records"])

    markdown = (out / "report.md").read_text()
    assert "Paired uplift: **0.0 pp**" in markdown
    assert "| B | 4 | 100.0% |" in markdown
    assert "| A | closed-book | " in markdown and "| none |" in markdown
    assert "| B | mcp-fixture | fixture | model-training-data | salt: `salt_reference` |" in markdown
    queue = json.loads((out / QUEUE_FILE).read_text())
    assert len(queue) == 8
    assert all("arm" not in item and all(label["verdict"] == "unreviewed" for label in item["labels"]) for item in queue)
    assert gate_failures(report) == []


def test_single_arm_run_scores_one_toolchain_alone(tmp_path):
    out = tmp_path / "single"
    args = run_args(out, [f"only={PROFILES / 'closed-book.json'}"], trials=1)
    suite, arms, manifest = run.plan(args)
    run.execute(args, suite, arms, manifest)
    report = write_report(out)
    assert report["status"].startswith("Single arm")
    assert report["comparison"]["comparisons"] == {}
    assert report["comparison"]["arms"]["only"]["confirmed_pass_fraction"] == 1.0
    assert report["comparison"]["arms"]["only"]["avg_at_k"] == 1.0
    assert gate_failures(report) == []
    assert "## Paired comparison" not in (out / "report.md").read_text()


def test_single_arm_gate_fails_while_anything_is_unresolved(tmp_path):
    """One MCP scored alone with unreadable judge output is not a pass; the gate must say so."""
    broken_judge = get_model(
        "mockllm/judge",
        custom_outputs=lambda messages, tools, tool_choice, config: ModelOutput.from_content("mockllm/judge", "not json"),
        memoize=False,
    )
    out = tmp_path / "single-unresolved"
    args = run_args(out, [f"only={PROFILES / 'closed-book.json'}"], trials=1, judge=broken_judge)
    suite, arms, manifest = run.plan(args)
    run.execute(args, suite, arms, manifest)
    report = write_report(out)
    assert report["status"].startswith("Single arm")
    assert report["comparison"]["blocked"] is True
    # The code case's only judge criterion is advisory, so it still passes on deterministic checks;
    # the instruct case is judge-only and becomes unresolved.
    assert report["comparison"]["unresolved"]["review"] == 1
    assert report["comparison"]["arms"]["only"]["confirmed_pass_fraction"] == 0.5
    assert gate_failures(report) == ['unresolved items: {"review": 1, "execution_error": 0, "no_artifact": 0}']


def test_plan_records_mcp_tool_inventory_and_fails_fast_on_unreachable_server(tmp_path, mcp_profile):
    """Supplying an MCP means the first signal is whether it answers and what it exposes."""
    closed = PROFILES / "closed-book.json"
    _, _, manifest = run.plan(run_args(tmp_path / "inventory", [f"A={closed}", f"B={mcp_profile}"], trials=1))
    assert manifest["arms"]["A"]["mcp_tools"] == {}
    assert manifest["arms"]["B"]["mcp_tools"] == {"salt": ["salt_reference"]}

    server = {"name": "salt", "transport": "stdio", "command": "salt-eval-no-such-binary", "args": []}
    broken = write_json(
        tmp_path / "broken.json",
        {"id": "broken", "revision": "x", "knowledge_revision": "model-training-data", "mcp_servers": [server]},
    )
    with pytest.raises(run.RunError, match=r"arm B: MCP server 'salt' \(stdio salt-eval-no-such-binary\) is unreachable: FileNotFoundError"):
        run.plan(run_args(tmp_path / "broken-run", [f"A={closed}", f"B={broken}"], trials=1))

    _, _, skipped = run.plan(run_args(tmp_path / "skipped", [f"A={closed}", f"B={broken}"], trials=1, skip_mcp_preflight=True))
    assert "mcp_tools" not in skipped["arms"]["B"]


def test_profile_naming_a_tool_the_server_lacks_is_rejected(tmp_path, mcp_profile):
    data = json.loads(mcp_profile.read_text())
    data["mcp_servers"][0]["tools"] = ["salt_reference", "salt_review"]
    narrowed = write_json(tmp_path / "narrowed.json", data)
    with pytest.raises(ProfileError, match=r"does not expose \['salt_review'\]; it exposes \['salt_reference'\]"):
        mcp_inventory(load_profile(narrowed))


def test_missing_artifact_fails_the_code_case_and_blocks_nothing_else(tmp_path):
    task = salt_task(suite=str(EXAMPLE_SUITE), profile=str(PROFILES / "closed-book.json"), arm="A", trial=1, track="code")
    logs = inspect_eval(
        task,
        model=planner_model({"instruct": INSTRUCT_ANSWER, "code": None}),
        model_roles={"grader": judge_model()},
        log_dir=str(tmp_path / "logs"),
        display="none",
    )
    assert logs[0].status == "success", logs[0].error
    [record] = records_from_logs(tmp_path / "logs")
    assert record["failure_reason"] == "no-artifact"
    assert record_outcome(record) == "fail"
    assert {row["verdict"] for row in record["effective"]} == {"missing"}


def test_resume_skips_completed_items_and_never_duplicates_logs(tmp_path):
    out = tmp_path / "resume"
    args = run_args(out, [f"A={PROFILES / 'closed-book.json'}"], trials=1)
    suite, arms, manifest = run.plan(args)
    run.execute(args, suite, arms, manifest)
    before = sorted(p.name for p in (out / "logs").glob("*.eval"))
    assert len(before) == 2

    resumed = run_args(out, [f"A={PROFILES / 'closed-book.json'}"], trials=1, resume=True)
    suite, arms, manifest = run.plan(resumed)
    run.execute(resumed, suite, arms, manifest)
    assert sorted(p.name for p in (out / "logs").glob("*.eval")) == before
    assert len(records_from_logs(out / "logs")) == 2

    with pytest.raises(FileExistsError):
        run.execute(args, suite, arms, manifest)


def test_report_marks_missing_scheduled_trials_provisional(tmp_path):
    out = tmp_path / "partial"
    args = run_args(out, [f"A={PROFILES / 'closed-book.json'}"], trials=2)
    suite, arms, manifest = run.plan(args)
    manifest["schedule"] = manifest["schedule"][:2]
    run.execute(args, suite, arms, manifest)
    full = json.loads((out / "manifest.json").read_text())
    full["schedule"] = run.build_manifest(full["arguments"], suite, arms, args.seed, 2, False)["schedule"]
    (out / "manifest.json").write_text(json.dumps(full))
    report = build_report(out)
    assert report["status"].startswith("PROVISIONAL")
    assert len(report["missing_or_extra_scheduled_trials"]) == 2
    assert gate_failures(report)
