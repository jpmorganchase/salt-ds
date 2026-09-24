"""JSON Schema validation for every document salt-eval reads or writes."""

from functools import lru_cache
import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import best_match
from referencing import Registry, Resource

PACKAGE_ROOT = Path(__file__).resolve().parent.parent
SCHEMAS_DIR = PACKAGE_ROOT / "schemas"

KINDS = (
    "suite",
    "case",
    "profile",
    "calibration",
    "review",
    "grader-request",
    "grader-result",
)


class SchemaError(ValueError):
    """A document failed schema validation. `problems` lists JSON-pointer paths with messages."""

    def __init__(self, source: str, problems: list[str]):
        self.source = source
        self.problems = problems
        super().__init__(f"{source}: " + "; ".join(problems))


@lru_cache(maxsize=1)
def _registry() -> Registry:
    resources = []
    for path in sorted(SCHEMAS_DIR.glob("*.schema.json")):
        schema = json.loads(path.read_text())
        resources.append((schema["$id"], Resource.from_contents(schema)))
    return Registry().with_resources(resources)


@lru_cache(maxsize=None)
def validator(kind: str) -> Draft202012Validator:
    if kind not in KINDS:
        raise KeyError(f"Unknown schema kind {kind!r}; expected one of {KINDS}")
    schema = json.loads((SCHEMAS_DIR / f"{kind}.schema.json").read_text())
    return Draft202012Validator(
        schema, registry=_registry(), format_checker=FormatChecker()
    )


def _pointer(error) -> str:
    return "/" + "/".join(str(p) for p in error.absolute_path) or "/"


DISCRIMINATORS = ("grader", "transport")


def _explain(error) -> list:
    """Flatten a oneOf failure to the errors of the branch selected by the discriminator field."""
    if not error.context:
        return [error]
    branches: dict[int, list] = {}
    for sub in error.context:
        branches.setdefault(sub.schema_path[0], []).append(sub)

    def discriminator_errors(errors) -> list:
        return [
            sub
            for sub in errors
            if sub.validator in {"const", "enum"} and list(sub.relative_path) in [[d] for d in DISCRIMINATORS]
        ]

    viable = [errors for errors in branches.values() if not discriminator_errors(errors)]
    if not viable:
        # Every branch rejected the discriminator value itself; the enum error lists the valid values.
        rejected = discriminator_errors(error.context)
        return [max(rejected, key=lambda sub: sub.validator == "enum")] if rejected else [best_match(error.context)]
    chosen = min(viable, key=len)
    return [leaf for sub in chosen for leaf in _explain(sub)]


def problems(kind: str, data) -> list[str]:
    """Return human-readable validation problems, empty when the document is valid."""
    found = []
    for error in sorted(validator(kind).iter_errors(data), key=lambda e: list(e.absolute_path)):
        for leaf in _explain(error):
            found.append(f"{_pointer(leaf)}: {leaf.message}")
    return sorted(set(found))


def validate(kind: str, data, source: str = "<memory>") -> None:
    found = problems(kind, data)
    if found:
        raise SchemaError(source, found)


def load_validated(kind: str, path: Path):
    """Parse a JSON file and validate it. The boundary where untrusted files become typed data."""
    try:
        data = json.loads(path.read_text())
    except json.JSONDecodeError as exc:
        raise SchemaError(str(path), [f"invalid JSON: {exc}"]) from exc
    validate(kind, data, str(path))
    return data
