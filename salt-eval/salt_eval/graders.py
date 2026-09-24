"""Bridge to the TypeScript deterministic graders (tooling/eval-graders).

One `node bin/salt-eval-grade.mjs --serve` process per Python process, kept warm so the
TypeScript program is built once. Requests and results are single JSON lines validated
against schemas/grader-request and schemas/grader-result. A harness fault (daemon down,
malformed reply, grader `error`) becomes a `review` verdict, never an agent failure.
"""

import asyncio
import atexit
import json
import os
from pathlib import Path
import subprocess
import threading
import uuid

from .schema import PACKAGE_ROOT, SchemaError, validate

REPO_ROOT = PACKAGE_ROOT.parent
GRADER_BIN = REPO_ROOT / "tooling" / "eval-graders" / "bin" / "salt-eval-grade.mjs"
DEFAULT_CACHE_DIR = PACKAGE_ROOT / ".work"
FIXTURES_DIR = PACKAGE_ROOT / "fixtures"
READY_TIMEOUT_SECONDS = 120


class GraderError(RuntimeError):
    """The grader process failed as a whole. Callers report affected criteria as `review`."""


class GraderDaemon:
    def __init__(self, salt_types: str = "src", cache_dir: Path = DEFAULT_CACHE_DIR):
        self.salt_types = salt_types
        self.cache_dir = Path(cache_dir)
        self._process: subprocess.Popen | None = None
        self._lock = threading.Lock()
        self.ready_info: dict = {}
        self.stderr_path = self.cache_dir / "grader-stderr.log"

    def command(self) -> list[str]:
        return [
            os.environ.get("SALT_EVAL_NODE", "node"),
            "--disable-warning=ExperimentalWarning",
            str(GRADER_BIN),
            "--serve",
            "--repo",
            str(REPO_ROOT),
            "--fixtures-dir",
            str(FIXTURES_DIR),
            "--cache-dir",
            str(self.cache_dir),
            "--salt-types",
            self.salt_types,
        ]

    def start(self) -> None:
        if self._process and self._process.poll() is None:
            return
        if not GRADER_BIN.exists():
            raise GraderError(f"grader binary missing at {GRADER_BIN}; run `yarn` at the repository root")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        # stderr goes to a file rather than a pipe so a chatty grader can never deadlock the bridge.
        with self.stderr_path.open("w") as stderr:
            self._process = subprocess.Popen(
                self.command(),
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=stderr,
                text=True,
                cwd=REPO_ROOT,
            )
        line = self._readline(READY_TIMEOUT_SECONDS)
        try:
            self.ready_info = json.loads(line)
        except json.JSONDecodeError as exc:
            raise GraderError(f"grader did not announce readiness: {line!r}") from exc
        if not self.ready_info.get("ready"):
            raise GraderError(f"grader failed to start: {self.ready_info}")

    def _readline(self, timeout: float) -> str:
        process = self._process
        assert process and process.stdout
        result: list[str] = []
        reader = threading.Thread(target=lambda: result.append(process.stdout.readline()), daemon=True)
        reader.start()
        reader.join(timeout)
        if reader.is_alive() or not result or not result[0]:
            self.close()
            raise GraderError(f"grader produced no reply within {timeout}s{self._stderr_tail()}")
        return result[0]

    def _stderr_tail(self) -> str:
        try:
            text = self.stderr_path.read_text().strip()
        except OSError:
            return ""
        return f"; stderr: {text[-2000:]}" if text else ""

    def grade(self, files: dict[str, str], checks: list[dict], fixture: str | None = None, timeout: float = 300) -> list[dict]:
        """Grade one artifact. Returns grader-result `results` in the order of `checks`."""
        request = {
            "id": uuid.uuid4().hex,
            "files": files,
            "checks": [{k: c[k] for k in ("id", "grader", "params") if k in c} for c in checks],
        }
        if fixture:
            request["fixture"] = fixture
        try:
            validate("grader-request", request, "grader request")
        except SchemaError as exc:
            raise GraderError(str(exc)) from exc
        with self._lock:
            self.start()
            assert self._process and self._process.stdin
            try:
                self._process.stdin.write(json.dumps(request) + "\n")
                self._process.stdin.flush()
            except (BrokenPipeError, OSError) as exc:
                self.close()
                raise GraderError(f"grader process went away: {exc}") from exc
            line = self._readline(timeout)
        try:
            reply = json.loads(line)
            validate("grader-result", reply, "grader result")
        except (json.JSONDecodeError, SchemaError) as exc:
            raise GraderError(f"grader reply invalid: {exc}") from exc
        if reply["id"] != request["id"]:
            raise GraderError("grader reply id mismatch")
        if "error" in reply:
            raise GraderError(reply["error"])
        by_id = {r["id"]: r for r in reply["results"]}
        return [
            by_id.get(
                c["id"],
                {"id": c["id"], "verdict": "error", "diagnostics": ["grader returned no result"], "evidence": []},
            )
            for c in checks
        ]

    async def grade_async(self, files, checks, fixture=None) -> list[dict]:
        return await asyncio.to_thread(self.grade, files, checks, fixture)

    def close(self) -> None:
        process, self._process = self._process, None
        if process is None:
            return
        for stream in (process.stdin, process.stdout):
            try:
                if stream:
                    stream.close()
            except OSError:
                pass
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()


GRADER_VERDICTS = {"correct": "correct", "wrong": "wrong", "error": "review"}


def to_rows(results: list[dict], checks: list[dict]) -> list[dict]:
    """Grader results to criterion rows in the harness verdict vocabulary."""
    by_id = {c["id"]: c for c in checks}
    rows = []
    for result in results:
        criterion = by_id[result["id"]]
        verdict = GRADER_VERDICTS[result["verdict"]]
        reason = "; ".join(result["diagnostics"]) or {"correct": "check passed", "wrong": "check failed"}.get(verdict, "")
        if result["verdict"] == "error":
            reason = f"grader error (harness fault, needs review): {reason}"
        rows.append(
            {
                "id": criterion["id"],
                "verdict": verdict,
                "quotes": [e["text"] for e in result["evidence"] if e.get("text")],
                "source_ids": list(criterion.get("source_ids", [])),
                "reason": reason,
                "severity": criterion["severity"],
                "evidence": result["evidence"],
            }
        )
    return rows


_shared: dict[str, GraderDaemon] = {}


def shared_daemon(salt_types: str = "src") -> GraderDaemon:
    daemon = _shared.get(salt_types)
    if daemon is None:
        daemon = _shared[salt_types] = GraderDaemon(salt_types=salt_types)
        atexit.register(daemon.close)
    return daemon
