"""The two tracks: what the planner is asked to produce and how the artifact is extracted.

Everything track-specific lives in this table so the task, scorer and report never
branch on the track name themselves.
"""

from dataclasses import dataclass
import json
import re
from typing import Callable

from ._util import digest

INSTRUCT_PROMPT = """You advise engineers on Salt implementation.
Produce concise implementation instructions, not application code. Resolve the
request's Salt-specific decisions and name applicable components, composition,
and state/API placement. Use the available Salt tools when needed. Include source
references for documentation-dependent recommendations. Identify genuinely
missing information without inventing APIs. Do not include a self-assessment.
"""

CODE_PROMPT = """You implement UI with the Salt design system in a React and TypeScript
application that already has Salt installed and its provider configured.
Answer with exactly one fenced ```tsx code block containing one self-contained module
that exports the requested component. Import only from "@salt-ds/core", "@salt-ds/icons",
"@salt-ds/lab", "@salt-ds/date-components" or "react". Do not invent props or components;
use the available Salt tools to look them up when unsure. Do not include install steps
or application wiring. Brief prose before the block is fine. Do not add a second code
block. If several files are genuinely required, answer instead with exactly one fenced
```json block of the form {"files": {"src/Name.tsx": "<contents>"}}.
"""

FENCE = re.compile(r"```([A-Za-z0-9_+-]*)[^\n]*\n(.*?)```", re.S)
TSX_LANGUAGES = {"tsx", "jsx", "typescript", "ts"}
DEFAULT_MODULE = "src/Solution.tsx"


def _valid_files(candidate) -> dict[str, str] | None:
    if not isinstance(candidate, dict) or not candidate:
        return None
    for path, content in candidate.items():
        if not isinstance(path, str) or not isinstance(content, str):
            return None
        if path.startswith("/") or ".." in path or "\0" in path:
            return None
    return candidate


def files_from_completion(completion: str) -> dict[str, str] | None:
    """Exactly one tsx-like block, or exactly one json files manifest. Anything else is no artifact."""
    blocks = FENCE.findall(completion)
    code = [body for language, body in blocks if language.lower() in TSX_LANGUAGES]
    manifests = [body for language, body in blocks if language.lower() == "json"]
    if len(code) == 1 and not manifests:
        return {DEFAULT_MODULE: code[0]}
    if len(manifests) == 1 and not code:
        try:
            return _valid_files(json.loads(manifests[0]).get("files"))
        except (json.JSONDecodeError, AttributeError):
            return None
    return None


def text_as_file(completion: str) -> dict[str, str]:
    return {"response.md": completion}


@dataclass(frozen=True)
class Track:
    id: str
    planner_prompt: str
    artifact: Callable[[str], dict[str, str] | None]
    time_limit: int

    @property
    def prompt_sha256(self) -> str:
        return digest(self.planner_prompt)


TRACKS: dict[str, Track] = {
    "instruct": Track("instruct", INSTRUCT_PROMPT, text_as_file, time_limit=180),
    "code": Track("code", CODE_PROMPT, files_from_completion, time_limit=300),
}
