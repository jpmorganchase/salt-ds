# Axe Scan Mechanics

Shared reference for Phase 1 and Phase 3. Covers path construction, verification, and the combined scan + parse command pattern.

---

## Path Construction

The agent must compute **two paths** — one absolute (for file reads, mkdir, mv, rm) and one relative (for `--save` flags in terminal commands that `cd` into the project directory).

### SCANS_DIR (absolute)

Determine the absolute path to the directory containing `SKILL.md`, then append `/scans/`.
- Example: `SCANS_DIR = /path/to/.agents/skills/ada-accessibility-skill/scans`
- **Verify:** Must start with `/` (Unix/macOS) or a drive letter (Windows).
- **Use for:** `read_file`, `mkdir -p`, `mv`, `rm`, `ls`.

### SAVE_PATH_REL (relative from project directory)

Compute the **relative path from the project directory to the scans directory**. Required for all `--save` flags.
- Example: If project is at `/path/to/Sample App` and SCANS_DIR is `/path/to/.agents/skills/ada-accessibility-skill/scans`, then `SAVE_PATH_REL = ../.agents/skills/ada-accessibility-skill/scans`
- **Use for:** `--save "${SAVE_PATH_REL}/axe-results.json"` in any command that first `cd`s into the project directory.

**Why relative:** axe-core/cli resolves `--save` relative to CWD. An absolute path after `cd "<project-dir>"` produces a doubled path and `ENOENT`. Always use relative.

### Verify before scanning

After computing `SAVE_PATH_REL`, verify it resolves correctly from the project CWD:
```bash
cd "<project-dir>" && ls -d "${SAVE_PATH_REL}/" 2>/dev/null && echo "PATH_OK" || echo "PATH_FAIL"
```
If `PATH_FAIL`: recompute before proceeding.

### Pre-flight and post-save

Before any scan: `mkdir -p "${SCANS_DIR}"`

After any scan with `--save`: verify the output file exists. Interpret in context of the exit code (see `protocols/error_recovery.md` → Exit Code Awareness): missing file + exit 1 = path error; missing file + exit 0 = expected (zero violations).

### General rules

- Always quote paths in terminal commands (spaces in project names).
- Do not use a bare `scans/` path from the project directory — it saves to the wrong location.

---

## Combined Scan + Parse

Chain the axe scan and the compact parser (`bin/parse-axe-results.js`) into a single terminal command. Use `;` (not `&&`) — axe exits with code 1 when violations are found, and `&&` would skip the parser. Guard the parse with `[ -f <saved-file> ]` to handle exit 0 (no file created).

See each phase doc for the specific command and concrete example.
