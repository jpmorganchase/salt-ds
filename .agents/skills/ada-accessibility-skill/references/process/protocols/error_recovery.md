# Error Recovery Protocol

Universal error recovery rules that apply across all phases and commands.

## Retry Limit

After any command failure, the agent may make **one** adjusted attempt — a different approach informed by the error output, not an identical retry. If the adjusted attempt also fails, **immediately surface the problem to the developer** with:

- What command was run and the full error output
- What adjusted approach was attempted and its result
- The agent's hypothesis on the root cause
- A clear prompt for the developer to provide guidance, choose an alternative, or decide to skip

**Never:** retry the same command more than once, silently skip a failed step, or continue in a loop trying variations without developer input. When the developer provides guidance, treat it as the adjusted attempt — if it also fails, surface again rather than continuing autonomously.

## Exit Code Awareness

Interpret command output artifacts in the context of the command's exit code. A tool that reports success (exit 0) but produces no output file has an empty result set — not a file path error. Only diagnose a missing output file as a write/path error when the exit code indicates output should have been produced.

**Applies to axe-core/cli:** Exit code 0 (no violations) may not create the `--save` output file. This is expected — proceed with zero findings. Exit code 1 (violations found) should always produce the output file — if missing, investigate the save path.
