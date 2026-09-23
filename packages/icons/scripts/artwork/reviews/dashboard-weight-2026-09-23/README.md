# Dashboard tick weight follow-up

The previous spacing repair reduced the outline ticks to 60% of the primary stroke, which weakened their balance with the gauge. Restore primary line weight while retaining the corrected radial placement and detached relationship. The existing spacing remains open at every checked width; no additional movement is needed. Widen the inverse tick slots from 1 to 1.5 construction units to match the solid needle counter, preserving their restrained inner corner softening.

Both variants were checked at 12px and 16px, light and dark, reference 0.67, light 1, standard 4/3 and heavy 1.5. The real Storybook components and CSS masks were checked in native button contexts, with dimensions confirmed; masks retain their baked reference width. The full 550-icon validator passes, including 416 focused detail checks. A new painted-width measurement ensures spacing checks cannot approve another reduction in tick weight. Existing Dashboard metadata is unchanged; registration passes with the two existing spaced-synonym warnings.

This supersedes the Dashboard secondary-weight treatment in the preceding detail-recognition review. Other repairs from that review remain current. Formal whole-catalogue corner sign-off remains separate.
