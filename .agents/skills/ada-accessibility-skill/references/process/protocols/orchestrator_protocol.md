# Sub-Agent Orchestrator Protocol

**This is the default execution mode.** Always attempt to dispatch sub-agents for each phase. If sub-agent dispatch fails at runtime (tool unavailable or errors), fall back to single-agent mode as described in `agent.md`.

## Core Principle: Main Agent = Pure Orchestrator

The main agent **never does the heavy lifting**. It only:
1. Handles startup questions (Q1, a11y.md choice, Q2)
2. Detects project environment
3. Creates the a11y.md skeleton, reads existing, or loads previous results for review-only output (see `agent.md` → Startup Questions → Returning User)
4. Dispatches sub-agents with focused context and instructions (skipped if developer chose "Load previous results")
5. Reviews a11y.md after all sub-agents finish for accuracy; writes corrections only if issues are found
6. **Generates the final summary output in the chat window** (NOT a sub-agent — sub-agent context is not visible to the developer)

## a11y.md Write Responsibilities

**Sub-agents read and write a11y.md directly during their phase.** Since phases execute sequentially (never concurrently), there are no write conflicts. Each sub-agent must:
- Read a11y.md at the start of its work to understand existing state
- Write its findings directly using the templates from `templates/finding_templates.md` and the rules from `protocols/a11y_file_protocol.md`
- Deduplicate before writing — if a finding for the same file/element already exists, merge the `Detected by` and `Notes` fields rather than creating a duplicate entry
- Return a brief summary to the main agent (for dispatching the next sub-agent with context)

The main agent writes to a11y.md **only** in these cases:
1. **Creating the initial skeleton** before Phase 1
2. **Writing the Scan History entry** for the current run after all phases complete, using `templates/scan_history_template.md` (sub-agents must NOT write to Scan History)
3. **Correcting issues** it spots when reviewing a11y.md after sub-agents finish
4. **Updating entries during interactive walkthroughs** with the developer (remaining issues, unmapped axe remediation, manual review items)

## Sub-Agent Flow

```
Main Agent (Orchestrator)
  ├─ Startup questions (Q1, a11y.md choice, Q2) + environment detection
  ├─ Creates a11y.md skeleton, reads existing, or loads previous results
  │   (reads templates/a11y_skeleton.md for structure, a11y_file_protocol.md for existing-file handling)
  │
  ├─ [If "Load previous results"] → Skip all sub-agents
  │   → Load output_template.md
  │   → Render full output from existing a11y.md data
  │   → Present follow-up options → Await developer input
  │   (a11y.md is read-only until developer requests changes via walkthrough)
  │
  ├─ Sub-Agent 1: axe-core Scanner (Phase 1)
  │   Context: phase1_automated_scanning.md, axe_scan_mechanics.md, axe_rule_mapping.md, a11y_file_protocol.md, finding_templates.md,
  │            error_recovery.md, scans directory absolute path (SCANS_DIR),
  │            project directory path, Phase 1 URLs
  │   → Verifies axe-core/cli is installed (loads axe_installation.md only if not found)
  │   → Proceeds directly to scan (previous-run artifacts are cleaned up during startup)
  │   → Runs axe-core/cli scan, saves results to axe-results.json
  │   → Parses violations via bin/parse-axe-results.js (falls back to read_file),
  │     writes findings to a11y.md per finding_templates.md
  │     (exit code 0 with no output file: records `Phase 1 result: 0 violations detected`
  │      in Scan Metadata, skips JSON parsing, returns zero-findings summary)
  │   → Returns brief summary to main agent
  │
  ├─ Main Agent: Verify Phase 1 results recorded in a11y.md (Gate 1)
  │   → Reads a11y.md to confirm Phase 1 findings are recorded or
  │     `Phase 1 result: 0 violations detected` is set in Scan Metadata
  │   → Passes context to Phase 2 sub-agent
  │
  ├─ Sub-Agent 2: Manual Code Reviewer (Phase 2)
  │   Context: phase2_manual_review.md, review_logic.md, axe_rule_mapping.md, a11y_file_protocol.md, finding_templates.md, additional_sections.md,
  │            Phase 1 results, detected frontend directory, design system info
  │   Loads ALL checkpoint reference docs + review_logic.md + a11y_file_protocol.md + finding_templates.md + additional_sections.md **in parallel**
  │   (all 10 reads in one batch) at start of review
  │
  │   **CRITICAL DISPATCH CONSTRAINTS for Sub-Agent 2:**
  │   - Every code change must have a corresponding finding entry in a11y.md. No exceptions.
  │   - Every finding must pass through the Context-Aware Inference decision flow in `review_logic.md`
  │     before being categorized — the distinction between defect, best practice, and flagged-for-review
  │     is determined by that flow, not by the sub-agent's judgment alone.
  │
  │   → Runs grep-based file discovery internally (up to 3 grep calls)
  │   → Builds own review queue (priority tier + broader sweep tier)
  │   → Reads flagged files + broader sweep
  │   → Uses context-aware inference
  │   → Applies fixes for findings WITH corresponding guidance in references/checks/
  │   → For unmapped axe findings: follows unmapped finding protocol
  │     (see `protocols/axe_rule_mapping.md` → Unmapped Axe Findings Protocol).
  │   → Reads a11y.md to see Phase 1 findings, writes Phase 2 findings and fix records directly to a11y.md
  │   → Returns brief summary to main agent
  │
  ├─ Main Agent: Verify Phase 2 findings written to a11y.md (Gate 2)
  │   → Reads a11y.md to confirm Phase 2 findings are recorded
  │
  ├─ Sub-Agent 3: Validation & QA Scanner (Phase 3 — MANDATORY)
  │   **Always runs.** Contains two components:
  │
  │   **CRITICAL DISPATCH CONSTRAINTS for Sub-Agent 3:**
  │   - Instruct the sub-agent it must NOT write to the Scan History section of a11y.md
  │   - Instruct the sub-agent to renumber all findings to a contiguous 1..N sequence as the FIRST QA step
  │   - Instruct the sub-agent to verify recorded findings against actual source file state — every code
  │     change must have a corresponding finding entry, and every finding's categorization must align with
  │     the decision flow in `review_logic.md`
  │   - Instruct the sub-agent to complete the Completion Checklist before returning
  │
  │   COMPONENT A — Validation Re-Scan (conditional):
  │   Condition: Q2=Yes AND Phase 1 succeeded AND fixes were applied in Phase 2
  │   Context: phase3_validation.md, axe_scan_mechanics.md, axe_rule_mapping.md, a11y_file_protocol.md, finding_templates.md,
  │            error_recovery.md, Phase 1 URLs, Q2 answer, Phase 1 completion status, number of fixes applied,
  │            Phase 1 baseline results, all checkpoint reference docs
  │   → Re-runs npx @axe-core/cli with same excluded rules against same URLs
  │   → Compares results to Phase 1 baseline via bin/parse-axe-results.js --compare
  │     (falls back to read_file; classifies findings as resolved / remaining / new)
  │   → For remaining + new: reads source files, examines context, determines remediation idea
  │     (for chat output only — NOT written to a11y.md)
  │   → Does NOT apply any fixes — guidance only
  │   → Aware of targeted rule validation syntax (--rules <axe-rule-id>) for use during
  │      the post-output interactive remediation flows (see agent.md → Completion Sequence)
  │
  │   COMPONENT B — QA Review (always runs):
  │   Context: all findings from previous phases, review_logic.md, skill guardrails
  │   Loads checkpoint reference docs on-demand for spot-checking
  │   → Reviews ALL entries for accuracy (including validation findings if Component A ran)
  │   → Validates findings align with checkpoint guidance
  │   → Writes validation findings and QA corrections directly to a11y.md
  │   → Returns brief summary to main agent
  │
  │   **Sub-Agent 3 is mandatory.** If validation conditions are not met, Component A
  │   is skipped but Component B (QA) still runs. If dispatch fails entirely, the main
  │   agent must perform QA checks itself before generating output.
  │
  └─ Main Agent: Final Output
      → Reviews a11y.md for any remaining issues; writes corrections only if needed
      → Verify `#### Finding [#]` numbers are 1..N in ascending document order; renumber if not
      → Writes the current run's Scan History entry to a11y.md using `templates/scan_history_template.md`, aggregating data from all completed phases
      → Loads output_template.md for RENDER blocks
      → Generates formatted summary in chat window for the developer
      → Renders the follow-up options prompt for the developer
      → The main agent (NOT a sub-agent) handles any interactive walkthrough,
        since it requires back-and-forth with the developer
  │
  └─ Main Agent: Server Cleanup
      → If the agent started the dev server during this run: kill the process, verify port is freed
      → If the developer's server was already running: do nothing
```

## Efficiency Guidelines

- **Sub-agents read their own phase file.** When dispatching a sub-agent, instruct it to read its phase file (e.g., `phases/phase1_automated_scanning.md`) directly — do NOT summarize or paraphrase reference file content in the prompt. The phase files contain cross-references to all other docs the sub-agent needs. The main agent's prompt should provide only runtime values (SCANS_DIR, project path, URLs, environment info, Phase 1 summary for later phases) and direct the sub-agent to its phase file.
- **Pre-load prerequisite docs.** Any doc listed in the sub-agent's Context line above should be loaded at dispatch time alongside the phase file — not discovered lazily via cross-references. This ensures the sub-agent has everything it needs before starting work.
- Give each sub-agent ONLY the context it needs (relevant reference docs, file locations, a11y.md state)
- Sub-agents should be scoped to finish quickly — don't overload one sub-agent
- If a sub-agent encounters an error, it should note the error in a11y.md and return — not hang
- If the agent started a dev server, it must terminate it once all scanning and validation (including any interactive walkthrough fixes requiring targeted validation) are complete. Never leave an agent-started server running. Never kill a server the developer started.

---

## Fallback: Single-Agent Mode

Fall back to single-agent mode when:
- Sub-agent dispatch fails at runtime (tool unavailable or errors)
- The environment does not support sub-agent creation
- Sub-agent dispatch returns an error on the first attempt

**Detection:** If the first sub-agent dispatch call fails or returns an unsupported-tool error, **switch immediately to single-agent mode for the entire run.** Do not retry sub-agents after switching.

**How it works:** The main agent executes all phases itself within one context window:
1. **Phase 1 → Phase 2 → Phase 3** — execute sequentially, respecting all phase ordering rules and phase transition gates from `agent.md`
2. **a11y.md tracking:** Write findings to a11y.md between phases using the templates from `templates/finding_templates.md` and the rules from `protocols/a11y_file_protocol.md`
3. **Load reference docs per the Conditional Loading Rules** in `agent.md` — the same on-demand loading rules apply to conserve context window

**What stays the same:** Everything in `agent.md` applies identically in single-agent mode — all Review Guardrails, Phase Transition Gates, Scope (9 checkpoints), Command Policy, Fallback Chain, Output Template, and Completion Sequence.
