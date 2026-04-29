# Output Template

After completing the review, generate output using exclusively the **content within** the RENDER blocks below in order. Replace all `[placeholders]` with actual values. Do not add content outside these blocks. **Do NOT include the `<!-- RENDER:BEGIN -->` / `<!-- RENDER:END -->` HTML comment tags in your output — those are structural markers for the agent, not content for the developer.** Each RENDER block has a conditional note (e.g., "Include this section only if..."). If the condition is not met, **omit the entire block**.

**CRITICAL — No trailing prose:** The `follow-up-options` RENDER block MUST be the absolute last content rendered in the chat. Do NOT add any text, summary, sign-off, or commentary after it (e.g., no "The scan is complete!" or "Let me know if you need anything else"). The follow-up options are the end of the output.

## Scope Notice

<!-- RENDER:BEGIN scope-notice -->
> **Scope:** This review targets 9 DAKB checkpoints for remediation. [If Q2=Yes, append: "Including additional accessibility checks from axe automated scanning."]
>
> **Scan method:** [Full (axe-core/cli + manual review) | Manual only (automated scanning skipped)]
>
> **Disclaimer:** [If Q2=Yes: "Automated scanning (axe-core/cli) is experimental. Results may contain false positives, and rule-to-DAKB checkpoint mappings may be incomplete."] Always review all findings and code changes from this agent before accepting them.
>
> **Please Note:** This does not capture all possible accessibility issues. Refer to internal DAKB documentation in the resource section for comprehensive guidance, testing and remediation requirements.
<!-- RENDER:END scope-notice -->

## Summary

<!-- RENDER:BEGIN summary -->
**Total Issues Identified: [total]**

**Fixes Applied: [total]**
- **1.1.1-01** Image Accessibility: [n] fixed
- **1.3.1-28** Table Header Nesting: [n] fixed
- **1.3.1-37** Form Control Labels: [n] fixed
- **2.4.4-01** Link Purpose: [n] fixed
- **3.1.1-01** Language of Page — Valid lang attribute: [n] fixed
- **3.1.1-02** Language of Page — Correct language: [n] fixed
- **3.1.2-01** Language of Parts — Valid lang values: [n] fixed
- **3.1.2-02** Language of Parts — Language changes identified: [n] fixed
- **4.1.2-03** Button Accessible Names: [n] fixed

**Flagged for Review: [total]**

**Best Practice Recommendations: [total]**

**Additional Findings: [total]** *(automated scan only — experimental, may contain false positives; see disclaimer above)*

*Note: Additional Findings with `flagged for review` status are included in the Flagged for Review count. Best Practice Recommendations are not counted as issues.*
<!-- RENDER:END summary -->

## Concise Findings

This is the **default view** rendered immediately after the summary. It groups ALL findings by status in a scannable format. Each entry is a single line — no Guidance field, no multi-line detail. The developer can request the detailed breakdown via follow-up option 1.

<!-- RENDER:BEGIN concise-findings -->

### Fixed
| # | Checkpoint | What | Where | Fix |
|---|---|---|---|---|
| [n] | [checkpoint-id] | [element] — [brief issue] | [file path] (Line [#]) | [one-line fix description] |

### Flagged for Review
| # | Checkpoint | What | Where | Why Flagged |
|---|---|---|---|---|
| [n] | [checkpoint-id] | [element] — [brief issue] | [file path] (Line [#]) | [one-line reason] |

### Best Practice Recommendations
*(Include only if applicable)*

| # | Checkpoint | What | Where | Suggestion |
|---|---|---|---|---|
| [n] | [checkpoint-id] | [element] | [file path] (Line [#]) | [one-line suggestion] |

### Additional Accessibility Findings
*(Include only if automated tools found issues outside the 9 checkpoints)*

| # | Checkpoint | What | Where | Impact | Status |
|---|---|---|---|---|---|
| [n] | [checkpoint-id] | [element] — [brief issue] | [file path or URL] | [impact] | flagged for review |

**Checkpoint column resolution rule:** Use the DAKB Checkpoint ID if available (e.g., `1.3.1-37`). If no DAKB mapping exists, use WCAG SC (e.g., `2.4.2`). If neither is confidently known, use `Mapping Guidance TBD`. Never combine multiple identifiers (e.g., do not write `3.1.1 / 3.1.1-01 / html-has-lang`).

<!-- RENDER:END concise-findings -->

## Not Applicable / Skipped

Include this section only if any checks or phases were skipped. This tells the developer what coverage they received and what was missed.

<!-- RENDER:BEGIN not-applicable -->
**Skipped Items:**
- [Phase or check]: [Reason it was skipped]
<!-- RENDER:END not-applicable -->

<!-- RENDER:BEGIN additional-resources -->
## Additional Resources

- [Salt Components Documentation](https://www.saltdesignsystem.com/salt/components/index)
- [Salt GitHub Repository](https://github.com/jpmorganchase/salt-ds)
- [Salt Support and Contributions](https://www.saltdesignsystem.com/salt/support-and-contributions/index)
- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
<!-- RENDER:END additional-resources -->

## What Would You Like to Do Next?

Always render this block after Additional Resources. Conditionally include/exclude individual options based on the rules noted below. **This block MUST be the final content rendered. Do NOT add any text, summary, sign-off, or commentary after this block.**

<!-- RENDER:BEGIN follow-up-options -->
## What Would You Like to Do Next?

1. **Get a detailed breakdown of all findings** — Full per-fix detail with What/Where/Why/Fix/Guidance fields, plus detailed Remaining Issues, Manual Review, Best Practice, and Additional Findings sections (also can be found in a11y.md) *(always render when any findings exist)*
2. **Review any of the applied fixes** — Deep dive into why a specific fix was applied and alternatives considered *(only render if at least one fix was applied)*
3. **Walk through remaining issues one at a time (Beta)** — I'll present each unfixed item (remaining validation issues, manual review items, unmapped axe findings) with remediation options and let you decide. *Note: This feature is in beta — always manually review the agent's suggestions.* *(only render if there are unfixed items)*
4. **Learn more about the best practice recommendations** — Understand the suggestions and decide if you'd like to implement them *(only render if best practice recommendations exist)*
5. **Conduct online research on a specific issue (Beta)** — I'll search for authoritative guidance on any finding and return with updated recommendations. *Note: This feature is in beta — results depend on search availability and may not always find relevant guidance.*
<!-- RENDER:END follow-up-options -->

---

## Detailed Breakdown (Follow-Up Option)

**Render the blocks below ONLY when the developer selects follow-up option 1 ("Get a detailed breakdown of all findings").** These are NOT part of the default output. When rendering this detailed view, include the scope-notice and summary blocks again for context, then render each applicable block below in order.

### Fixes Applied (Detailed)

Group entries by checkpoint. Create one entry per finding.

The **Guidance** field is educational. It should:
- Explain why the original code is an accessibility issue (not just restate the rule)
- Explain why the chosen fix is the best approach given the application's tech stack (e.g., if using Salt DS, explain why the Salt approach is preferred over generic HTML/ARIA)
- Briefly mention that alternatives exist where applicable, but explain why this fix was chosen

<!-- RENDER:BEGIN fixes-applied-detail -->
#### [Checkpoint ID] — [Description] ([n] fixes)

**Fix [#]**
- **What:** [Element] — [Brief description of the issue found]
- **Where:** [file path] (Line [#])
- **Why:** [One sentence: why this is an accessibility issue]
- **Fix:** [Exact code change that was made]
- **Guidance:** [Explain why the original code fails the checkpoint, why this fix is the best approach for the tech stack in use, and reference the DAKB checkpoint]
<!-- RENDER:END fixes-applied-detail -->

### Remaining Issues (Post-Validation) (Detailed)

Include this section only if Phase 3 validation ran and found remaining or new issues. These are issues that persisted after fixes were applied, or new issues that appeared (possible regressions). The agent has investigated each one in the codebase and provides a remediation idea.

<!-- RENDER:BEGIN remaining-issues-detail -->
**Validation Summary:** [n] resolved, [n] remaining

**Issue [#]** ([WCAG SC] / [Checkpoint ID or axe rule])
- **What:** [Element] — [Brief description]
- **Where:** [file path] (Line [#])
- **Category:** [Remaining | New (possible regression)]
- **axe reported:** [What axe flagged in the validation scan]
- **Code context:** [What the agent found when examining the source — relevant surrounding code, related files, component relationships]
- **Remediation idea:** [Agent's recommended fix based on codebase analysis]
<!-- RENDER:END remaining-issues-detail -->

### Manual Review Required (Detailed)

List items that were NOT modified in the code.

The **Recommendation** field should:
- Provide actionable guidance with an "if possible" primary path and a fallback path
- Reference the tech stack where relevant (e.g., prefer Salt components over native HTML when Salt DS is in use)
- For component type changes (HTML → Salt), explain why the change was made, remind the developer to verify props/attributes, and note they can reject the change
- Communicate that the developer has final say

<!-- RENDER:BEGIN manual-review-detail -->
**Item [#]** ([Checkpoint ID])
- **What:** [Element] — [Brief description of the issue]
- **Where:** [file path] (Line [#])
- **Why Flagged:** [Why the fix could not be applied automatically]
- **Recommendation:** [Actionable guidance with primary and fallback approach. Reference the tech stack where relevant. Note that the developer can reject the proposed change and test manually if preferred.]
<!-- RENDER:END manual-review-detail -->

### Best Practice Recommendations (Detailed)

Include this section only if applicable. These items were NOT modified in the code and are NOT counted in the summary fix count.

<!-- RENDER:BEGIN best-practices-detail -->
**Recommendation [#]**
- **What:** [Element and current state]
- **Where:** [file path] (Line [#])
- **Suggestion:** [What could be improved and why]
<!-- RENDER:END best-practices-detail -->

### Additional Accessibility Findings (Detailed)

Include this section only if automated tools found issues outside the 9 checkpoints. These are NOT counted in the checkpoint summary but are valuable for the developer. These findings do NOT have corresponding guidance in `references/checks/` and were NOT auto-fixed.

<!-- RENDER:BEGIN additional-findings-detail -->
**Finding [#]**
- **Rule:** [axe rule ID or tool rule name]
- **WCAG SC:** [WCAG success criterion if known, e.g., 2.4.2 — otherwise "Mapping Guidance TBD"]
- **What:** [Element and issue description]
- **Where:** [file path or page URL]
- **Impact:** [critical / serious / moderate / minor]
- **Why it's a defect:** [Explain what the axe rule checks for and why the current code fails it. Be educational — help the developer understand the accessibility concern, not just the rule name.]
- **Status:** Not auto-fixed — requires developer decision.
- **Next step:** Select "Walk through remaining issues one at a time" from the follow-up options to receive context-specific remediation options for this finding. The agent will perform a deep contextual evaluation of the code at that point.

*IMPORTANT: These findings fall outside the skill's reference guidance. Proposed solutions (currently in Beta and may not be accurate) will be produced on-demand during the interactive walkthrough, where the agent reviews the issue flagged with context from the application to try to determine an appropriate remediation solution. If the agent cannot confidently determine a proposed solution during the walkthrough, it will recommend referring to the DAKB for authoritative guidance.*
<!-- RENDER:END additional-findings-detail -->
