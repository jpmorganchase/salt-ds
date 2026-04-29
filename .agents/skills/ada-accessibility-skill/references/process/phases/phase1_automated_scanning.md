# Phase 1 — Automated Scanning Protocol

This document covers the automated scanning phase using @axe-core/cli. This phase runs ONLY when the developer explicitly opts in (Q2=Yes). Load any prerequisite reference docs in parallel where possible (see `references/agent.md` → File Reading Efficiency).

## ⛔ Write Boundaries

**Phase 1 must NEVER write to:** Scan History, Best Practice Recommendation, False Positives.

## Tool: @axe-core/cli

**@axe-core/cli** — Runs axe-core in headless Chrome against live URLs. Framework-agnostic, no config required.

## Installation

### Installation Detection (MANDATORY)

Before attempting any scan, verify axe-core/cli is available:

```bash
npx @axe-core/cli --version 2>&1
```

- **Exit code 0:** axe-core/cli is available — proceed to scan. Do NOT load `tooling/axe_installation.md`.
- **Exit code non-zero:** axe-core/cli is not available. Load `references/process/tooling/axe_installation.md` and follow its installation guidance. After installation, re-verify with `--version` before proceeding.

This ensures the installation doc adds zero context cost on repeat runs where axe-core/cli is already installed.

### Quick Install Methods

Preferred (no permanent install):
```bash
npx --yes @axe-core/cli <URL>
```

If explicit install is needed (requires developer permission):
```bash
npm install --save-dev @axe-core/cli
```

For comprehensive installation guidance (prerequisites, troubleshooting, corporate environments), see `references/process/tooling/axe_installation.md`.

## Page & Route Discovery (MANDATORY)

Before building the scan command, the agent MUST discover all scannable pages and routes in the application. Scanning only the root URL misses issues on other pages (e.g., form label violations on a contact page, missing landmarks on an about page).

Examine the application's structure, framework, and routing approach to identify all available pages. Construct full URLs for each discovered page using the dev server base URL. If discovery is inconclusive, ask the developer what pages exist.

Record the final list of URLs in the a11y.md `Phase 1 URLs scanned` metadata field.

## Running a Scan

**The only JSON file Phase 1 may create in the scans directory is `axe-results.json`.** Do not create any other JSON files.

Follow `protocols/axe_scan_mechanics.md` for path construction, verification, and the combined command pattern. Run the scan + parse as a single command:

```bash
mkdir -p "${SCANS_DIR}"
cd "<project-dir>" && npx @axe-core/cli <URLS> --save "${SAVE_PATH_REL}/axe-results.json" --disable <EXCLUDED_RULES>; \
  [ -f "${SCANS_DIR}/axe-results.json" ] && node "${SCANS_DIR}/../bin/parse-axe-results.js" "${SCANS_DIR}/axe-results.json" || echo '{"totalViolations":0,"pages":[]}'
```

### Concrete example
```bash
# Project at: /Users/dev/My App
# SCANS_DIR:  /Users/dev/.agents/skills/ada-accessibility-skill/scans
# SAVE_PATH_REL (from project dir): ../.agents/skills/ada-accessibility-skill/scans

mkdir -p "/Users/dev/.agents/skills/ada-accessibility-skill/scans"
cd "/Users/dev/My App" && npx @axe-core/cli http://localhost:5173 http://localhost:5173/about --save "../.agents/skills/ada-accessibility-skill/scans/axe-results.json" --disable <EXCLUDED_RULES>; \
  [ -f "/Users/dev/.agents/skills/ada-accessibility-skill/scans/axe-results.json" ] && node "/Users/dev/.agents/skills/ada-accessibility-skill/bin/parse-axe-results.js" "/Users/dev/.agents/skills/ada-accessibility-skill/scans/axe-results.json" || echo '{"totalViolations":0,"pages":[]}'
```

Targeted rule validation (`--rules`) does NOT need `--save` since its output is small and self-contained.

**Fallback:** If the parse script fails or is not found, read `"${SCANS_DIR}/axe-results.json"` directly with `read_file`.

## Excluded Rules

See `protocols/axe_rule_mapping.md` → Excluded Rules for the authoritative `--disable` list. Use it with every axe-core/cli scan command.

## Interpreting Output

- **Exit code 0** = No violations found
- **Exit code 1** = Violations found (this is NOT an error — it means the scan worked and found issues)
- **Exit code 2+** = Actual errors (scan failed to run). Follow `protocols/error_recovery.md` → Retry Limit.

### Exit code 0 — Zero violations

axe-core/cli may not create the `--save` output file when there are zero violations. This is expected behavior — do NOT re-run the scan or treat the missing file as an error. Instead:
1. Update the `Phase 1 result` field in a11y.md Scan Metadata to `0 violations detected`
2. Skip JSON parsing — there are no findings to record
3. Return summary to main agent: "Phase 1 complete — 0 violations detected across [n] pages"
4. Proceed to Phase 2

### Exit code 1 — Violations found

The combined scan + parse command (see `agent.md` → Combined Scan + Parse) automatically parses the output. Read the compact parsed output from the terminal. **Fallback:** If the script fails or is not found, read `"${SCANS_DIR}/axe-results.json"` directly with `read_file`.

The compact output contains a `totalViolations` count and a `pages` array. Each page has its URL and violations. Each violation has:
- `id` — the axe rule ID (see `protocols/axe_rule_mapping.md` for checkpoint mapping)
- `impact` — severity level (critical, serious, moderate, minor)
- `tags` — array of tags including WCAG SC references (e.g., `wcag311` = SC 3.1.1), conformance level (`wcag2a`, `wcag2aa`), and `best-practice` flag
- `description` — human-readable description of the rule
- `help` — short help text (one-liner)
- `helpUrl` — link to Deque University documentation
- `nodes` — array of affected elements, each with:
  - `html` — source snippet of the failing element
  - `target` — CSS selector
  - `failureSummary` — human-readable fix hint from axe
  - `impact` — node-level severity

Iterate all violations across all pages to build the complete findings list.

**Completeness check:** Verify the `totalViolations` count matches expectations. Each unique rule ID + URL combination = one finding to record. Update the `Phase 1 result` field in a11y.md Scan Metadata to `[count] violations detected`.

## Recording Findings in a11y.md

**This section applies when the scan found violations (exit code 1).** If exit code was 0 (zero violations), the Interpreting Output → Exit code 0 path above handles metadata recording and skips to Phase 2 — this section is not reached.

Before writing any findings to a11y.md, load `protocols/a11y_file_protocol.md` and `templates/finding_templates.md`, and follow their structure exactly. `a11y_file_protocol.md` defines status values, dedup rules, write-access semantics, and `Detected by` merge format. `finding_templates.md` defines the required finding template (`#### Finding [#]` with specific fields), prohibited fields (no `Recommendation`, `Remediation idea`, or `Proposed solutions`), and numbering rules. Use `protocols/axe_rule_mapping.md` to classify each axe rule as mapped (written under its checkpoint heading) or unmapped (written under "Additional Accessibility Findings" with the unmapped finding template).

## Dev Server Requirements

axe-core/cli requires a running web server to scan. The scan URL must be accessible via HTTP/HTTPS.

### If the developer's server is already running
Use the URL they provide (e.g., `http://localhost:3000`, `http://localhost:5173`).

### If the developer wants the agent to start it
Try the project's dev server command (typically in `package.json` scripts):
- `npx vite` (Vite projects)
- `npx next dev` (Next.js)
- `npm start` or `npm run dev` (generic)
- `npx serve .` (static HTML fallback)
- `python -m http.server` (Python-based static server)

### If the dev server fails to start

Follow `protocols/error_recovery.md` → Retry Limit:

1. **Diagnose** — examine the error output for the root cause (dependency issues, port conflicts, missing configuration, version incompatibility, etc.)
2. **One informed attempt** — try to resolve based on the diagnosis
3. **Surface to the developer** if still failing — present what was tried, the error encountered, and your best assessment of the root cause. Ask whether they can help resolve it or prefer to skip automated scanning and proceed with manual review only.
4. **Act on the developer's decision** — if they provide guidance, try it. If they say skip, skip Phase 1 immediately and do not make additional autonomous attempts. Document what was tried in a11y.md and the "Not Applicable / Skipped" output section. Phase 3 validation re-scan will also skip since Phase 1 did not complete.

## Error Handling Summary

| Failure | Action | a11y.md Note |
|---|---|---|
| Developer declines tools (Q2=No) | Skip Phase 1 entirely | "Phase 1 skipped (developer preference)" |
| npm/npx not available | Skip Phase 1 | "Phase 1 skipped (npm not available)" |
| Install fails (proxy, permissions) | Skip Phase 1 | "Phase 1 skipped (install failed: [reason])" |
| Dev server won't start | Follow error recovery escalation above | "Phase 1 skipped after troubleshooting: [what was tried]" |
| Dev server needs auth/login | Skip axe scan | "Phase 1 skipped (authentication required)" |
| axe-core times out | Use results from completed URLs | "Phase 1 partial ({n}/{total} pages scanned)" |
| axe-core crashes | Report what was captured | "Phase 1 failed: [error]. Manual review only." |

**In all cases:** Phase 1 is NEVER a hard requirement. The skill gracefully falls back to Phase 2 (which includes grep discovery and manual review) when Phase 1 cannot run.
