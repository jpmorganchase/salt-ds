# output template

## overall assessment

- Give a short summary of design-system alignment, risk level, and the main theme of the review.
- For narrow debug/fix tasks, summarize the broken region, the likely root-cause theme, and whether the issue looks structural, wrapper-driven, or styling-only.

## highest-priority findings

- State the issue, why it matters, and the preferred Salt direction or fix.
- Order findings by impact rather than by file order.
- For narrow debug/fix tasks, lead with:
  - suspected root cause
  - smallest credible fix
  - why that fix is narrower or safer than broader redesign

## quick wins

- List small, high-leverage improvements that can be made without redesigning the whole UI.
- For narrow debug/fix tasks, use this section for:
  - minimal follow-up edits
  - wrapper cleanup checks
  - verification steps still needed

## salt compliance checks

- State whether the response used broad review mode or narrow debug/fix mode.
- Note which Salt primitives, patterns, or foundations were checked when judging component choice.
- State whether the review findings were validated against canonical Salt guidance.
- State which source-level validation surface was used when code was available:
  - `review_salt_ui`
  - `salt-ds review`
  - or no source-level validation
- If custom UI is retained, explain briefly why a standard Salt option does not appear to fit.
- Note whether local wrappers, patterns, or repo conventions were applied through the repo-aware Salt workflow or explicit repo guidance when they could change the review outcome.
- Note any token-family or direct-use checks that materially affected the review findings.

## suggested next checks

- Suggest follow-up checks such as keyboard flow, responsive states, story coverage, or version-specific validation.
- If a runnable URL exists and source review is still inconclusive, suggest `salt-ds doctor` or `salt-ds review <file-or-dir> --url <url>` as local evidence.
- If runtime evidence was used, note whether it came from browser-session inspection or a fetched-HTML fallback.
- If runtime evidence came from `browser-session`, you may use it to support findings about runtime errors, hydrated accessible names, landmark structure, or other rendered behavior.
- If runtime evidence came from `fetched-html`, keep the language narrower and frame it as structure-level evidence rather than full runtime validation.

Example runtime-assisted phrasing:

- `Browser-session evidence: the inspected page reported one console error on mount and rendered three unnamed buttons, which strengthens the recommendation to fix labeling before shipping.`
- `Fetched-html fallback evidence: the page structure includes a main landmark and a button cluster, but browser-session inspection is still needed before making claims about client-side behavior or focus flow.`

Example MCP-unavailable fallback phrasing:

- `MCP unavailable: canonical Salt guidance was checked through the Salt CLI fallback, source-level validation ran before runtime evidence, and the review still treats the CLI as transport rather than as a second policy layer.`
- `Fallback guidance: the review used the same Salt workflow, validated the source first through salt-ds review, then kept salt-ds doctor and salt-ds review --url reserved for local evidence only.`

Example debug/fix phrasing:

- `Debug/fix mode: the broken region is the left navigation shell, the likely root cause is centering applied at the shell wrapper instead of the navigation layout owner, and the smallest credible fix is to correct the parent flex alignment rather than patch the child items.`
- `Debug/fix mode: the metric row drift looks structural rather than cosmetic; the cards are being laid out with generic wrappers instead of the intended Salt composition, so the fix starts with the layout owner before touching individual card styles.`

If there are no material findings, say so explicitly and note any residual testing gaps or assumptions.
