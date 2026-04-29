# Empty Buttons

Buttons without a name (visible text content or accessible labels) do not convey the purpose of the button to screen reader reliant users. Icons inside buttons must always be hidden with `aria-hidden="true"` to prevent duplicate or conflicting announcements. This applies to Salt Button components, HTML `<button>` elements, and `<div>` elements with `role="button"`.

## Checkpoint Covered

- **4.1.2-03** — Button Accessible Names

## Common Issues

- Button has no visible text or `aria-label`
- Button has visible text AND `aria-label`
- Icons inside buttons are not hidden with `aria-hidden="true"`
- Icons inside buttons have `aria-label` (incorrect - label should be on button, not icon)

## Remediation Rules

1. **If button already has visible text**: That text will be used for the accessible name, do NOT add `aria-label` to button
2. **If button is icon-only (no visible text)**: Add `aria-label` to the button element. Determine the appropriate label value by analyzing available application context:
   - **Icon component name**: `<CloseIcon>` → "Close", `<DownloadIcon>` → "Download", `<SettingsIcon>` → "Settings"
   - **Event handlers**: `onClick={() => navigate('/settings')}` → confirms purpose is "Settings"
   - **Surrounding content**: A download icon adjacent to "Q1 2025 Report" → "Download Q1 2025 Report"
   - **Parent/sibling components**: A close icon inside a dialog header → "Close dialog"
   - If no reasonable label can be determined from any available context, **flag for manual review**. A label derived from available context (such as the icon name, handlers, or surrounding content) is better than no label — apply the fix even if the label could potentially be more specific, and note it as a best practice recommendation if a more descriptive label would improve clarity.
3. **For any icons inside buttons**: ALWAYS add `aria-hidden="true"` to icons within buttons, NEVER add `aria-label` to icons that are inside buttons. This rule is unconditional — apply it regardless of whether the button's accessible name (Rule 2) is fixed or flagged for review. These are independent checks under separate checkpoints. *Note: Adding `aria-hidden="true"` to an icon is an image accessibility fix. Count each icon hidden under 1.1.1-01 in the summary, not under 4.1.2-03. Record the icon fix as a separate finding entry under 1.1.1-01 — do not merge it into the button's 4.1.2-03 finding.*
4. **Conflicting names**: Button has both visible text AND `aria-label` with **different** values.
   - If the correct accessible name can be determined from application context (e.g., an `onClick` handler clearly indicates the button submits a form, so "Submit" is correct and `aria-label="Next Page"` is wrong), remove the incorrect `aria-label` and keep the visible text.
   - If the correct name cannot be determined from context, **flag for manual review**.
5. **Unclear purpose**: If the button's purpose cannot be determined after analyzing icon name, event handlers, surrounding content, parent components, and page context, **flag for manual review**. Do not guess — but do exhaust all available context before flagging.
6. **Redundant aria-label**: If a button has visible text AND `aria-label` with the **same** value, remove the `aria-label`. The visible text already provides the accessible name, so the `aria-label` is redundant. In the Guidance field, explain to the developer that ARIA attributes should not be used when the accessible name can be provided by native HTML or design system components. "Same" means a case-insensitive, whitespace-trimmed match (e.g., `aria-label="Download report"` and visible text "Download Report" are the same).

## Examples

### Using Salt Design System

```jsx
import { Button } from "@salt-ds/core";
import { DownloadIcon } from "@salt-ds/icons";

// CORRECT: Button with visible text, icon hidden
<Button>
  <DownloadIcon aria-hidden="true" />
  Download Report
</Button>

// CORRECT: Button with visible text only, no icon
<Button>
  Download Report
</Button>

// CORRECT: Icon-only button with aria-label on button, icon hidden
<Button aria-label="Download Report">
  <DownloadIcon aria-hidden="true" />
</Button>

// CORRECT: Each button has its own unique accessible name via aria-label that accurately describes its purpose
<Text>Q1 2025 Report</Text>
<Button aria-label="Download Q1 2025 Report">
  <DownloadIcon aria-hidden="true" />
</Button>
<Text>Q2 2025 Report</Text>
<Button aria-label="Download Q2 2025 Report">
  <DownloadIcon aria-hidden="true" />
</Button>

// INCORRECT: Button with visible text but icon not hidden
<Button>
  <DownloadIcon />
  Download Report
</Button>

// INCORRECT: Icon has aria-label instead of being hidden
<Button>
  <DownloadIcon aria-label="Download Report" />
  Download Report
</Button>

// INCORRECT: Redundant aria-label matches visible text.
// Fix: Remove aria-label; visible text already provides the accessible name.
<Button aria-label="Download Report">
  Download Report
</Button>

// INCORRECT: Button has visible text "Submit" AND a different aria-label "Next Page".
// Context: onClick handler calls submitForm(), confirming the button's purpose is to submit.
// Fix: Remove the incorrect aria-label; "Submit" is the correct accessible name.
<Button aria-label="Next Page" onClick={() => submitForm()}>
  Submit
</Button>

// FLAG FOR MANUAL REVIEW: Button has visible text "Submit" AND a different aria-label "Next Page"
// but no surrounding context to determine which name is correct.
<Button aria-label="Next Page">
  Submit
</Button>

// INCORRECT: Empty button with no accessible name
<Button>
  <DownloadIcon />
</Button>

// INCORRECT: Icon-only button with no accessible name and aria-label is on the icon, ** aria-label should be on the button**
<Button>
  <DownloadIcon aria-label="Download Report" />
</Button>

// INCORRECT: Icon-only button with aria-label but icon not hidden
<Button aria-label="Download Report">
  <DownloadIcon />
</Button>

// INCORRECT: Icon inside button has aria-label instead of aria-hidden, and button's aria-label is also redundant.
// Fix: Remove aria-label from icon, add aria-hidden="true" to icon. The button's aria-label provides the accessible name.
<Button aria-label="Download Report">
  <DownloadIcon aria-label="Download Report" />
</Button>

// INCORRECT: Multiple buttons with identical aria-labels. Ensure each button's accessible name reflects its specific purpose.
<Text>Q1 2025 Report</Text>
<Button aria-label="Download Report">
  <DownloadIcon aria-hidden="true" />
</Button>
<Text>Q2 2025 Report</Text>
<Button aria-label="Download Report">
  <DownloadIcon aria-hidden="true" />
</Button>
<Text>Q3 2025 Report</Text>
<Button aria-label="Download Report">
  <DownloadIcon aria-hidden="true" />
</Button>
```

### HTML Implementation

```html
<!-- CORRECT: Button with visible text, icon hidden -->
<button>
  <i class="icon-download" aria-hidden="true"></i>
  Download Report
</button>

<!-- CORRECT: Button with visible text only, no icon -->
<button>Download Report</button>

<!-- CORRECT: Icon-only button with aria-label on button, icon hidden -->
<button aria-label="Download Report">
  <i class="icon-download" aria-hidden="true"></i>
</button>

<!-- CORRECT: Element with role="button", visible text, icon hidden -->
<div role="button" tabindex="0">
  <i class="icon-download" aria-hidden="true"></i>
  Download Report
</div>

<!-- INCORRECT: Button with visible text but icon not hidden -->
<button>
  <i class="icon-download"></i>
  Download Report
</button>

<!-- INCORRECT: Icon has aria-label instead of being hidden -->
<button>
  <i class="icon-download" aria-label="Download Report"></i>
  Download Report
</button>

<!-- INCORRECT: Redundant aria-label matches visible text.
     Fix: Remove aria-label; visible text already provides the accessible name. -->
<button aria-label="Download Report">Download Report</button>

<!-- INCORRECT: Two separate buttons, each missing an accessible name -->
<button></button>
<button><i class="icon-download"></i></button>

<!-- INCORRECT: Icon-only button with aria-label on icon, not button -->
<button>
  <i class="icon-download" aria-label="Download Report"></i>
</button>

<!-- INCORRECT: Icon-only button with aria-label but icon not hidden -->
<button aria-label="Download Report">
  <i class="icon-download"></i>
</button>

<!-- INCORRECT: Icon inside button has aria-label instead of aria-hidden, and button's aria-label is also redundant.
     Fix: Remove aria-label from icon, add aria-hidden="true" to icon. -->
<button aria-label="Download Report">
  <i class="icon-download" aria-label="Download Report"></i>
</button>

<!-- INCORRECT: Element with role="button" but icon not hidden -->
<div role="button" tabindex="0">
  <i class="icon-download"></i>
  Download Report
</div>
```