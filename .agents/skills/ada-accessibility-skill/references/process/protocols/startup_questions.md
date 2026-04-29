# Startup Questions

This file contains the complete startup question flow for all users — returning users (existing a11y.md found), new users (no a11y.md), and returning users who chose Replace or Archive (which effectively starts a fresh scan).

Before doing any work, execute Q1 first, then determine the user type and follow the appropriate path below. Wait for all answers before proceeding to any phase. Load any independent file reads in parallel where possible (see `references/agent.md` → File Reading Efficiency).

**Question Presentation:** When presenting any question in this file with selectable options, follow the Question Presentation guidance in `references/agent.md`. Prefer using an interactive question tool (e.g., `vscode_askQuestions`); fall back to static text with numbered options only if the tool is unavailable or fails.

## Partial Scope

If the developer requests a partial audit (specific checkpoints, specific files, or a subset of the codebase), adjust scope accordingly. In the output, note which checkpoints were in scope and which were excluded.

---

## Q1: Skill Update Check

**Always ask first, regardless of returning user status — never skip.**

Ask the user:

> "Would you like me to check for skill updates before we begin?"

Options: "Yes, check for updates" (recommended) | "No, skip and proceed"

- If "Yes": Run `bash bin/check-update --force`
  - If output contains `UPGRADE_AVAILABLE X.X.X Y.Y.Y`:
    - Inform user: "Skill update available: v{Y.Y.Y} (current: v{X.X.X})"
    - Ask: "Would you like me to update the skill now?"
    - If user says **Yes**: Run `bash bin/update-skill`
    - If user says **No**: Proceed with current version
  - If no output: Say "Skill is up to date" and proceed
- If "No": Proceed to determining user type below.

---

## After Q1 — Determine User Type

After Q1 is complete, check whether a11y.md was found during Getting Started (Step 1 in SKILL.md).

- **If a11y.md exists** → follow the Returning User flow below
- **If no a11y.md** → check for orphaned JSON scan artifacts (`axe-results.json`, `axe-validation-results.json`) in `scans/`. If found, silently archive them to `scans/archive/axe-scan-YYYY-MM-DD_HH-MM-SS/` with a timestamp — without a11y.md they have no context and cannot be trusted. Then proceed to Q2 (new user).

---

## Returning User — Existing a11y.md Found

Present the following options:

> I found an existing `a11y.md` from a previous run. How would you like to proceed?
>
> 1. **Replace** — Delete the current a11y.md and start a fresh scan
> 2. **Archive** — Move the current a11y.md to Archive and start a fresh scan
> 3. **Load previous results** — Review the existing findings from your last run

### Option 1: Replace

Delete the existing a11y.md and any JSON scan artifacts from the previous run:
```bash
rm -f "${SCANS_DIR}/a11y.md"
rm -f "${SCANS_DIR}/axe-results.json"
rm -f "${SCANS_DIR}/axe-validation-results.json"
```
Then proceed as a **new user**: run the full Q2 flow below, create a fresh a11y.md skeleton, and execute all phases normally.

### Option 2: Archive

Move the existing a11y.md and any JSON scan artifacts to the archive directory with a timestamp:
```bash
mkdir -p "${SCANS_DIR}/archive/YYYY-MM-DD_HH-MM-SS"
mv "${SCANS_DIR}/a11y.md" "${SCANS_DIR}/archive/YYYY-MM-DD_HH-MM-SS/a11y.md"
[ -f "${SCANS_DIR}/axe-results.json" ] && mv "${SCANS_DIR}/axe-results.json" "${SCANS_DIR}/archive/YYYY-MM-DD_HH-MM-SS/axe-results.json"
[ -f "${SCANS_DIR}/axe-validation-results.json" ] && mv "${SCANS_DIR}/axe-validation-results.json" "${SCANS_DIR}/archive/YYYY-MM-DD_HH-MM-SS/axe-validation-results.json"
```
Then proceed as a **new user** (same as Replace after the move): run the full Q2 flow below, create a fresh a11y.md skeleton, and execute all phases normally.

### Option 3: Load Previous Results

Read the existing a11y.md in full. **Skip all phases (1, 2, 3).** Load `references/process/templates/output_template.md` and render the full output (scope-notice, summary, concise-findings, additional-resources, follow-up-options) populated from the existing a11y.md data. This allows the developer to pick up where they left off — reviewing findings, walking through remaining issues, requesting fixes, etc.

When generating output from a loaded a11y.md:
- Read the Scan Metadata section to populate the scope-notice and summary blocks
- Read the Findings section to populate the concise-findings tables (grouping by status: fixed, flagged for review, etc.)
- Read Best Practice Recommendations, False Positives, Additional Findings, and Not Applicable / Skipped sections as applicable
- Present the follow-up options so the developer can drill into details, walk through remaining issues, or request fixes
- **Do NOT update or modify a11y.md** — it is read-only in this mode until the developer explicitly requests changes (e.g., via a walkthrough fix)
- **Do NOT run usage tracking** — this is a load operation, not a new scan

---

## Q2: Automated Scanning Permission

Ask the user:

> " (Beta) Run an automated accessibility scan using axe-core/cli? (Experimental - results may contain false positives, and rule-to-DAKB checkpoint mappings may be incomplete. Confirm via manual review.)

Options:
- **"Run it"** — looks like axe-core/cli is already installed, just run the scan
- **"Install and run it"** — install axe-core/cli first, then run the scan (may require creating dependency files)
- **"Skip"** — skip automated scanning entirely → Proceed to environment auto-detection and phases
- **Custom answer** — developer may provide additional context (e.g., "it's installed globally", "use yarn", etc.) → Adapt accordingly

- If **Skip**: Skip Phase 1 entirely. Mark automated checks as "not applicable" in output. Proceed to environment auto-detection and phases.
- If **Run it / Install and run it / Custom (Yes)**: The agent automatically detects whether a dev server is already running (by checking common ports) and automatically starts one if needed. See `phases/phase1_automated_scanning.md` → Dev Server Requirements for the full detection and troubleshooting escalation chain. **Only ask the developer about the dev server if you do not know how to handle it after trying to automatically detect**

**Note:** In all references throughout the skill documentation, "Q2" refers to this automated scanning question (formerly Q3). The a11y.md file creation step between Q1 and Q2 is an automatic requirement, not a numbered question.

## Auto-Inferred (Do Not Ask)

Detect these automatically without asking (skip if already stored in a11y.md from a previous run):
- **Frontend directory**: from project structure — check for `src/`, `app/`, `client/`, `pages/`, `components/`, `views/` at the project root; use framework conventions (Next.js → `app/` or `pages/`, Vite/CRA → `src/`, Angular → `src/app/`); check `package.json` `main` or `source` fields. The developer can also specify this in their initial prompt. If auto-detection cannot determine the frontend directory with confidence, ask the developer as a dynamic one-off fallback question.
- **Package manager**: from lock files (`package-lock.json` → npm, `yarn.lock` → yarn, `pnpm-lock.yaml` → pnpm)
- **Design system**: from package.json dependencies (`@salt-ds/` → Salt, `@mui/` → MUI, `@chakra-ui/` → Chakra)
- **Framework**: from dependencies (`react` → React, `vue` → Vue, `angular` → Angular, `next` → Next.js, `svelte` → Svelte)
- **Routes**: from source code if SPA routing is detected (`<Route path=`, Next.js `pages/`, etc.) — conditional, only if relevant
