"""Toolchain profiles: the thing under test in one arm.

A profile turns into (a) Inspect tool sources for each MCP server and (b) extra
system prompt text from prompt files and the context bundle. Generation settings are
deliberately absent; they belong to the run so arms cannot differ in model config.
"""

import asyncio
from dataclasses import dataclass
import os
from pathlib import Path

from inspect_ai.tool import ToolDef, mcp_server_http, mcp_server_stdio, mcp_tools

from ._util import digest
from .schema import load_validated

MCP_HANDSHAKE_TIMEOUT_SECONDS = 30.0


class ProfileError(ValueError):
    """The profile cannot be used as configured. Message says which server and why."""


@dataclass(frozen=True)
class Profile:
    path: Path
    data: dict
    sha256: str

    @property
    def id(self) -> str:
        return self.data["id"]

    @property
    def directory(self) -> Path:
        return self.path.parent

    def resolve(self, relative: str) -> Path:
        candidate = Path(relative).expanduser()
        return candidate if candidate.is_absolute() else (self.directory / candidate).resolve()


def load_profile(path: Path | str) -> Profile:
    path = Path(path).resolve()
    data = load_validated("profile", path)
    return Profile(path=path, data=data, sha256=digest(data))


def missing_environment(profile: Profile) -> list[str]:
    """Environment variable names the profile needs that are not set. Checked before any model call."""
    names = []
    for server in profile.data.get("mcp_servers", []):
        if server["transport"] == "http":
            names.append(server["url_env"])
        else:
            names.extend(server.get("env_names", []))
    return [name for name in names if name not in os.environ]


def missing_files(profile: Profile) -> list[str]:
    paths = [profile.resolve(p) for p in profile.data.get("system_prompt_files", [])]
    return [str(p) for p in paths if not p.is_file()]


def _server(profile: Profile, server: dict):
    if server["transport"] == "http":
        kwargs = {"name": server["name"], "url": os.environ[server["url_env"]]}
        token_env = server.get("token_env")
        if token_env and os.environ.get(token_env):
            # Inspect resolves "$NAME" from the environment; the profile never stores the token.
            kwargs["authorization"] = "$" + token_env
        return mcp_server_http(**kwargs)
    cwd = server.get("cwd")
    return mcp_server_stdio(
        name=server["name"],
        command=server["command"],
        args=server.get("args", []),
        cwd=str(profile.resolve(cwd)) if cwd else None,
        env={name: os.environ[name] for name in server.get("env_names", [])},
    )


def build_tools(profile: Profile) -> list:
    return [mcp_tools(_server(profile, server), tools=server.get("tools", "all")) for server in profile.data.get("mcp_servers", [])]


def _describe(server: dict) -> str:
    if server["transport"] == "http":
        return f"http {server['url_env']}={os.environ.get(server['url_env'], '<unset>')}"
    return "stdio " + " ".join([server["command"], *server.get("args", [])])


def _leaf_errors(exc: BaseException) -> list[str]:
    if isinstance(exc, BaseExceptionGroup):
        return [message for sub in exc.exceptions for message in _leaf_errors(sub)]
    return [f"{type(exc).__name__}: {exc}"]


async def _list_tool_names(profile: Profile, server: dict, timeout: float) -> list[str]:
    source = mcp_tools(_server(profile, server), tools="all")
    tools = await asyncio.wait_for(source.tools(), timeout=timeout)
    return sorted(ToolDef(tool).name for tool in tools)


def mcp_inventory(profile: Profile, timeout: float = MCP_HANDSHAKE_TIMEOUT_SECONDS) -> dict[str, list[str]]:
    """Connect to every MCP server in the profile and list its tools. No model call.

    Fails before a single trial is scheduled when a server cannot start, does not answer
    within `timeout`, or lacks a tool the profile names. The result is recorded in the run
    manifest so a report can say exactly which tools each arm exposed.
    """
    inventory = {}
    for server in profile.data.get("mcp_servers", []):
        try:
            names = asyncio.run(_list_tool_names(profile, server, timeout))
        except TimeoutError:
            raise ProfileError(f"MCP server {server['name']!r} ({_describe(server)}) did not answer list_tools within {timeout:g}s") from None
        except (KeyboardInterrupt, SystemExit):
            raise
        except BaseException as exc:  # the MCP client raises ExceptionGroup for transport failures
            detail = "; ".join(_leaf_errors(exc)) or type(exc).__name__
            raise ProfileError(f"MCP server {server['name']!r} ({_describe(server)}) is unreachable: {detail}") from None
        if not names:
            raise ProfileError(f"MCP server {server['name']!r} ({_describe(server)}) exposes no tools")
        wanted = server.get("tools", "all")
        if wanted != "all":
            absent = sorted(set(wanted) - set(names))
            if absent:
                raise ProfileError(f"MCP server {server['name']!r} does not expose {absent}; it exposes {names}")
        inventory[server["name"]] = names
    return inventory


def context_bundle(profile: Profile) -> tuple[str, dict]:
    """Concatenate bundle files in sorted order up to max_chars. Returns (text, accounting)."""
    bundle = profile.data.get("context_bundle")
    if not bundle:
        return "", {"files": [], "chars": 0, "truncated": False}
    root = profile.resolve(bundle.get("root", "."))
    files = sorted({p for pattern in bundle["include"] for p in root.glob(pattern) if p.is_file()})
    parts, included, chars, truncated = [], [], 0, False
    for path in files:
        text = path.read_text()
        header = f"\n\n<file path=\"{path.relative_to(root)}\">\n"
        footer = "\n</file>"
        needed = len(header) + len(text) + len(footer)
        if chars + needed > bundle["max_chars"]:
            truncated = True
            break
        parts.append(header + text + footer)
        included.append(str(path.relative_to(root)))
        chars += needed
    text = "".join(parts)
    if text:
        text = "The following reference documents are provided verbatim." + text
    return text, {"files": included, "chars": chars, "truncated": truncated, "candidates": len(files)}


def system_prompt_suffix(profile: Profile) -> tuple[str, dict]:
    """Extra system prompt text from prompt files plus the context bundle."""
    parts = [profile.resolve(p).read_text().strip() for p in profile.data.get("system_prompt_files", [])]
    bundle_text, accounting = context_bundle(profile)
    if bundle_text:
        parts.append(bundle_text)
    return "\n\n".join(p for p in parts if p), accounting
