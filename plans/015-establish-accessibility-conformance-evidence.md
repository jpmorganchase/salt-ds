# Plan 015: Replace blanket WCAG claims with maintained component evidence

> **Executor instructions**: Follow this design-and-evidence plan step by step, run every verification command, honor STOP conditions, and update this plan's row in `plans/README.md` when complete.
>
> **Drift check (run first)**: `git diff --stat 338971164..HEAD -- README.md site/docs/index.mdx site/docs/about site/docs/components packages/core/src/__tests__/__e2e__`

## Status

- **Priority**: P3
- **Effort**: L
- **Risk**: MED
- **Depends on**: Plan 011; the lab-only ColorChooser finding is explicitly excluded from this conformance program
- **Category**: docs, direction
- **Planned at**: commit `338971164`, 2026-07-12

## Why this matters

The README calls Salt a “WCAG 2.1 compliant solution,” while public evidence is a mix of automated checks, supported AT/browser combinations, component guidance, and known disabled cases. Salt should distinguish design target, tested behavior, exceptions, and formal conformance, then build toward a visible WCAG 2.2 component program.

## Current state

- `README.md:61-68` makes the blanket compliance statement and lists screen-reader/browser support.
- `site/docs/index.mdx:75-78` says all components follow WCAG 2.1 AA as a core requirement.
- Component accessibility pages and Cypress `*.accessibility.cy.tsx` files provide uneven evidence.
- Plan 011 addresses currently skipped Spinner completion cases. The lab-only ColorChooser finding is recorded as rejected and must not be represented as stable-core conformance evidence.

## Deliverable

Create an approved conformance model and pilot manifest for a small set of high-use stable core components. The model must link success criteria, automated tests, manual AT/browser evidence, known exceptions, review date, and accountable owner.

## Commands you will need

| Purpose            | Command                                          | Expected                          |
| ------------------ | ------------------------------------------------ | --------------------------------- |
| Inventory          | repository searches for accessibility docs/specs | every stable component classified |
| Automated evidence | focused Cypress accessibility specs              | all pilot specs pass              |
| Docs               | `yarn workspace @salt-ds/site spellcheck`        | exit 0                            |
| Site               | `yarn workspace @salt-ds/site build`             | exit 0                            |

## Scope

Accessibility claim wording, evidence model/manifest, pilot component docs/tests, and governance instructions. Out of scope: claiming formal third-party certification, bulk remediation of every component, or changing design tokens.

## Git workflow

Use the operator's branch or `codex/015-a11y-evidence`; separate claim wording from pilot test remediations where possible. Do not push/open a PR unless instructed.

## Steps

1. Inventory stable components, existing accessibility docs, axe checks, keyboard tests, and manual AT evidence. Mark unknown rather than inferring pass.
2. With accessibility/legal/product owners, define vocabulary: target, tested, supported, exception, and formally conformant. Recommend removing “compliant” unless backed by an appropriate assessment.
3. Design a machine-readable or structured manifest and pilot 3-5 high-use components across NVDA/Firefox, JAWS/Chrome, and VoiceOver/Safari as applicable.
4. Update top-level wording to link the evidence and known limitations. Introduce WCAG 2.2 criteria incrementally rather than making a new blanket promise.
5. Add review cadence and CI checks for stale/missing pilot evidence.

## Test plan

For each pilot component, link automated axe/keyboard/focus tests and recorded manual AT/browser scenarios. Validate manifest schema, stale review dates, broken evidence links, spellcheck, and site build.

## Done criteria

- [ ] Public wording distinguishes goals from verified conformance.
- [ ] Pilot evidence links to tests/manual records and has review dates.
- [ ] Known exceptions are visible and owned.
- [ ] Spellcheck/site build and pilot accessibility tests pass.

## STOP conditions

- Stakeholders require a legal conformance claim without formal assessment.
- Manual AT evidence cannot be stored publicly; define a safe reference/attestation mechanism before proceeding.

## Maintenance notes

Automated axe success is necessary but not sufficient. Require manual evidence for interaction-heavy components.
