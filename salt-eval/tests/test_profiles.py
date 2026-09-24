import json

import pytest

from salt_eval.profiles import build_tools, context_bundle, load_profile, missing_environment, missing_files
from salt_eval.schema import SchemaError

from .conftest import PACKAGE, write_json

PROFILES = PACKAGE / "profiles"


def test_shipped_profiles_load():
    ids = [load_profile(p).id for p in sorted(PROFILES.glob("*.json"))]
    assert ids == ["closed-book", "docs-bundle", "mcp-http-example", "mcp-stdio-example"]


def test_http_profile_reports_missing_environment(monkeypatch):
    monkeypatch.delenv("SALT_MCP_URL", raising=False)
    profile = load_profile(PROFILES / "mcp-http.example.json")
    assert missing_environment(profile) == ["SALT_MCP_URL"]
    monkeypatch.setenv("SALT_MCP_URL", "https://example.test/mcp")
    assert missing_environment(profile) == []


def test_missing_prompt_file_is_reported(tmp_path):
    path = write_json(
        tmp_path / "p.json",
        {"id": "p", "revision": "r", "knowledge_revision": "k", "system_prompt_files": ["rules/absent.md"]},
    )
    assert missing_files(load_profile(path)) == [str(tmp_path / "rules" / "absent.md")]


def test_context_bundle_stops_at_the_cap_and_records_the_cut(tmp_path):
    docs = tmp_path / "docs"
    docs.mkdir()
    (docs / "a.mdx").write_text("A" * 100)
    (docs / "b.mdx").write_text("B" * 100)
    (docs / "c.mdx").write_text("C" * 100)
    path = write_json(
        tmp_path / "p.json",
        {
            "id": "p",
            "revision": "r",
            "knowledge_revision": "k",
            "context_bundle": {"root": "docs", "include": ["*.mdx"], "max_chars": 260},
        },
    )
    text, accounting = context_bundle(load_profile(path))
    assert accounting == {"files": ["a.mdx", "b.mdx"], "chars": 2 * (100 + len('\n\n<file path="a.mdx">\n') + len("\n</file>")), "truncated": True, "candidates": 3}
    assert text.startswith("The following reference documents are provided verbatim.")
    assert "CCCC" not in text


def test_stdio_profile_builds_one_tool_source_per_server(tmp_path):
    path = write_json(
        tmp_path / "p.json",
        {
            "id": "p",
            "revision": "r",
            "knowledge_revision": "k",
            "mcp_servers": [
                {"name": "salt", "transport": "stdio", "command": "node", "args": ["server.js"], "tools": ["lookup"]},
                {"name": "docs", "transport": "stdio", "command": "node", "args": ["docs.js"]},
            ],
        },
    )
    assert len(build_tools(load_profile(path))) == 2


def test_secrets_in_profile_are_rejected_by_schema(tmp_path):
    path = write_json(
        tmp_path / "p.json",
        {"id": "p", "revision": "r", "knowledge_revision": "k", "mcp_servers": [{"name": "salt", "transport": "http", "url": "https://x"}]},
    )
    with pytest.raises(SchemaError):
        load_profile(path)
    assert json.loads(path.read_text())["mcp_servers"][0]["url"] == "https://x"
