# aXe Rule Classification Reference

Single source of truth for aXe rule classification, excluded rules, and all guidance related to mapped and unmapped findings. All sub-agents and the main agent reference this file.

## Excluded Rules

These aXe rules are explicitly excluded from scans (outside checkpoint scope). Use the `--disable` flag with this exact comma-separated list when running axe-core/cli:

```
accesskeys,aria-hidden-body,aria-braille-equivalent,bypass,color-contrast,color-contrast-enhanced,focus-order-semantics,frame-tested,frame-title,hidden-content,identical-links-same-purpose,label-content-name-mismatch,link-in-text-block,meta-viewport-large,meta-refresh-no-exceptions,p-as-heading,object-alt,no-autoplay-audio,server-side-image-map,tabindex,table-duplicate-name,table-fake-caption,target-size,video-caption
```

**This is the single authoritative definition of the excluded rules list.** Phase 3 validation and any other aXe commands must reference this same list. Do NOT duplicate this list elsewhere.

**Important:** Do NOT limit to only mapped rules. Exclude only the list above. Let aXe report everything else — findings outside the 9 checkpoints go to the "Additional Accessibility Findings" output section.

## aXe Rule → Checkpoint Mapping

| aXe Rule ID | Maps to Checkpoint | WCAG SC | Description |
|---|---|---|---|
| `image-alt` | 1.1.1-01 | 1.1.1 | Images must have alt text |
| `button-name` | 4.1.2-03 | 4.1.2 | Buttons must have accessible name |
| `link-name` | 2.4.4-01 | 2.4.4 | Links must have discernible text |
| `label` | 1.3.1-37 | 1.3.1 | Form elements must have labels |
| `html-has-lang` | 3.1.1-01 | 3.1.1 | HTML must have lang attribute |
| `html-lang-valid` | 3.1.1-01 | 3.1.1 | HTML lang must be valid |
| `valid-lang` | 3.1.2-01 | 3.1.2 | lang attributes must have valid values |
| `label-title-only` | 1.3.1-37 | 1.3.1 | Form elements must not rely on title attribute alone for labeling |
| `aria-valid-attr` | Cross-cutting | 4.1.2 | ARIA attributes must be valid |

## Unmapped aXe Findings Protocol

**Rules not in the mapping table above** do NOT have corresponding guidance in `references/checks/`. The agent must NOT auto-apply code fixes for unmapped rules during the normal phase flow (Phase 1–3). Instead, the agent must:

1. Record the finding in a11y.md under "Additional Accessibility Findings" with:
   - The aXe rule ID
   - Impact level
   - `Status: flagged for review`
   - `Why it's a defect` explanation (what the aXe rule checks for and why the current code fails it)
   - Notes (affected URLs, context)
   - **Do NOT include Proposed solutions in a11y.md** — see step 3 below
2. Document `**Why it's a defect**` in both the chat output and a11y.md. This explanation helps the developer understand the accessibility concern.
3. **Do NOT pre-generate Proposed solutions during phases.** Proposed solutions are generated on-demand only during the Unmapped aXe Remediation Walkthrough (below) when the developer explicitly opts in. Pre-generating solutions during phases produces shallow or incorrect recommendations.
4. Leave the code unchanged. Fixes for unmapped rules are only applied via the Unmapped aXe Remediation Walkthrough when the developer explicitly opts in.

If you cannot confidently determine even a `Why it's a defect` explanation, recommend the developer refer to the DAKB for authoritative guidance rather than guessing. Incorrect information is worse than no information.

## Targeted Rule Validation

axe-core/cli supports scanning for a specific rule using the `--rules` flag. Used during per-fix validation and the remediation walkthrough to confirm individual fixes without running a full scan.

### Syntax

```bash
# Single rule
npx @axe-core/cli <URL> --rules <axe-rule-id>

# Multiple rules (comma-separated, no spaces)
npx @axe-core/cli <URL> --rules rule1,rule2

# Combined with --disable (both flags work together)
npx @axe-core/cli <URL> --rules <axe-rule-id> --disable <other-rules>
```

**Notes:**
- Only aXe rule IDs are accepted (e.g., `region`, `image-alt`, `button-name`) — not WCAG criterion IDs or checkpoint numbers
- The short flag `-r` also works: `npx @axe-core/cli <URL> -r <axe-rule-id>`
- Use this for per-fix validation during remediation flows: after applying a fix, scan only the specific rule that was flagged to confirm resolution
- If the targeted validation still flags the rule after a fix: revert the change and leave the finding as `flagged for review`

### Q2 Dependency

Targeted validation requires Q2=Yes (axe-core/cli available). If Q2=No: inform the developer that fixes were applied but cannot be automatically validated — manual verification recommended.

## Unmapped aXe Remediation Walkthrough (Experimental)

Interactive post-output flow for unmapped findings. Loaded only when unmapped findings exist with `Status: flagged for review` after all phases complete. The main agent (not a sub-agent) handles this since it requires developer interaction.

**Prerequisite:** Unmapped findings must already be documented in a11y.md with aXe rule ID, impact level, and "Why it's a defect" explanation (documented during Phase 1/3).

### Prompt

Present this to the developer as the **last question** after all output has been rendered:

> "Would you like to walk through the aXe findings outside my reference guidance and discuss potential remediation solutions that would be appropriate for your application?"
>
> **BE AWARE:** This is an experimental enhancement to the skill, so be sure to always manually review the feedback/fixes from the agent.
>
> **A) Yes, walk through each one** — I'll evaluate each finding in your code, explain why it's a defect, present all viable remediation options for your specific situation, and let you decide.
>
> **B) Skip** — Leave all unmapped findings as documented.

### Walkthrough Protocol

1. Iterate through each unmapped finding with `Status: flagged for review` (skip any resolved by checkpoint fixes)

2. **For each finding, perform a fresh contextual evaluation:**
   - Read the source file where the flagged element lives
   - Review surrounding context: parent components, sibling elements, existing ARIA attributes, component hierarchy, related imports
   - Cross-reference the axe rule's requirements against the actual DOM/component structure
   - Identify **all viable remediation approaches** — do not limit to options documented earlier; the live code review may reveal additional or better options

3. **Show code context inline:** Always include the relevant source code snippet (5–15 lines centered on the flagged element) in a fenced code block. The developer should see the exact code being discussed without needing to open the file separately. File reads performed by the agent are not visible to the developer — only chat output is.

4. **Present to the developer:**
   - What the aXe rule checks for and why it's an accessibility defect in this specific context
   - All viable remediation options with context-specific reasoning and trade-offs
   - **Final option (always present):** "Conduct additional online research for this issue"

5. Ask the developer to: pick an option, skip this finding, mark as false positive, or conduct research

6. If the developer picks an option: apply the fix, then run targeted aXe validation (`npx @axe-core/cli <URL(s)> --rules <axe-rule-id>`). Report immediately whether the fix resolved the issue.

7. If validation fails: revert the change, look into why that might be and inform the developer, then propose a new recommendation and wait for approval.

8. If "research": conduct web search / documentation lookup for the aXe rule and the specific code pattern, then re-present updated options to the developer for this same finding

9. If developer marks as "false positive" or "skip": update a11y.md accordingly (`false positive (developer-confirmed)` or leave as `flagged for review`)

10. After all findings are walked through, update the Scan History in a11y.md: adjust the "Flagged for manual review" count to reflect items addressed during the walkthrough (see `templates/scan_history_template.md`)
