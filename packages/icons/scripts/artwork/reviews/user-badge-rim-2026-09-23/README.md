# User badge lower rim review — 23 September 2026

The existing filled User badge had a lower rim only about 0.30 final units thick at its base (0.22px at 12px). Its body opening was independently curved and nearly reached the outer circle. This was an existing defect, unchanged by the preceding weld-strength work.

The corrected body opening follows a concentric circle. Its lower rim is about 1.19 final units (0.89px at 12px), with softened shoulder-to-base corners. The outer badge circle, head and upper shoulder curves are retained. Filled geometry intentionally keeps the same contour at every stroke setting.

- Corrected: `user-badge.svg`, its React component and CSS mask.
- Retained after family comparison: User and User solid, User admin and User admin solid, User group and User group solid, User search, Add user and Remove user. Their current silhouettes remain distinct; this correction changes no shared people primitive.
- SVG comparisons: User badge before/after at 12px, 16px and 64px, widths 0.67/1/4⁄3/1.5, light/dark, DPR1. Family comparison at 12px/16px/48px at both theme widths: [light](light.png), [dark](dark.png).
- Generated component and CSS mask: rendered from local Storybook artwork and package styles, with temporary review layout, at 12px/16px/64px, all four width settings, light/dark, DPR1 and DPR2. CSS masks retain baked geometry. Native account-control comparisons at 12px/16px. Actual dimensions were verified in [surface checks](surface-checks.json): [DPR1](surfaces-dpr1.png), [DPR2](surfaces-dpr2.png).
- The final-paint regression checks the lower rim at five radial positions. It rejects the [previous SVG](before.svg) at all four widths and passes the corrected artwork: [measurements](rim-checks.json).
- Full generation and 550-export validation passed: [validation](validation.log). The scoped integration check passed with one existing spaced-synonym warning; catalogue identity and search metadata are unchanged.

This is a targeted local visual review, not independent human recognition feedback, brand approval or a complete corner-review migration. No unrelated icon artwork was changed.

Final SVG SHA-256: `17f8f0133ea0591e3eec1f58cb1324862b17e8f76aa4ab3f7aefa83bd801a7d3`.
