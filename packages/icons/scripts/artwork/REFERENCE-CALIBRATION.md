# Reference calibration notes

These measurements record local design comparisons used during the September 2026 redraw. They are implementation evidence, not global radius or spacing tokens, and must be remeasured when the referenced artwork changes. Follow [Icon design](../../../../site/docs/foundations/assets/icon-design.mdx) for the current visual standard and [Maintaining Salt icons](../../MAINTAINING.md) for construction and review.

The supplied references contain different proportions even for isolated plus-shaped marks:

| Supplied reference                 | Local painted width W |      Inside radius R |              R / W |
| ---------------------------------- | --------------------: | -------------------: | -----------------: |
| `AI-01.svg`, isolated plus         |  approximately 1.4301 | approximately 0.9535 | approximately 0.67 |
| `Blockchain-02.svg`, separate plus |  approximately 1.4301 | approximately 1.4302 | approximately 1.00 |

These are direct examples of plus-shaped crossings, not standalone diagonal close symbols. Applying the same concave-corner treatment to a diagonal cross follows the system geometry rule; its weld strength still needs a native-size comparison.

Other measured structural anchors keep the comparison local:

| Junction in the supplied references                            | Visible radius / local band width |
| -------------------------------------------------------------- | --------------------------------- |
| Calendar binding roots (`calendar1`, `calendar2`)              | approximately 0.50                |
| Bank roof-to-column attachments (`Bank-01`, `bank`)            | approximately 0.67 and 0.75       |
| Globe central grid crossings (`globe`)                         | approximately 0.50                |
| Screen-to-stand attachments (`computer_graph`, `Ecommerce-03`) | approximately 0.50 and 0.67       |

Calendar’s binding roots and Globe’s central grid crossings use circular transitions. At the high/medium default, their visible radius/local-width ratios are approximately 0.50 and 0.496 respectively, comparable to the corresponding reference anchors. Globe’s other ellipse attachments retain their separately constructed curved transitions. These are local comparisons, not a claim that every junction is a circular fillet. Solar ray roots use a custom blend in the supplied reference; the revised Light uses eight equal, extended rays with circular tangent fillets at a round center (R/W approximately 0.519 at W = 4/3), preserving a sun silhouette beside the toothed Settings gear. These stroke-based Calendar, Globe and Light proportions vary across widths, unlike the fixed compact marks below.

These measurements use each source SVG's own coordinates; the ratio enables comparison across canvases. They are **reference examples, not minimum and maximum tokens** for every icon. Preserve flat terminals, enough straight arm or member length, repeated-feature rhythm and open counters. Inspect the painted result at 12px and 16px before accepting a proportional match seen only when enlarged.

Representative system constructions show how the same reference language adapts to shorter members. These are final visible ratios at primary W = 4/3, not construction helper radii:

| Exposed system junction                         | Approximate R / local W | Nearest reference comparison and adjustment                                           |
| ----------------------------------------------- | ----------------------: | ------------------------------------------------------------------------------------- |
| Build report and Medical kit handle roots       |           0.55 and 0.44 | Calendar binding roots (0.50); retain each handle's opening.                          |
| Coffee handle roots                             |               0.32–0.43 | Calendar and screen attachments (0.50–0.67); shorter, unequal available runs.         |
| Microphone foot                                 |                    0.42 | Screen-to-stand attachments (0.50–0.67); preserve the short horizontal foot.          |
| Hierarchy node roots and Share node attachments |      0.31–0.42 and 0.31 | Globe's connected grid (0.50); smaller nodes need open centers and distinct branches. |

Bank's six columns use equal-weight rails and column strokes, with neighboring circular roots meeting at the midpoint of each narrow channel. This removes pointed notches produced by overlapping fillets. Its local 1.25-unit construction radius is smaller than the former overlapping 1.8-unit profile; the 1.125-unit construction stroke preserves the openings. The roof and plinth apertures follow the same interior-corner default. Judge the exposed radius and channel clearance together at native size; historical measurements of the previous Bank drawing are not measurements of this revision.

Holiday's compact sun uses the solar references' connected ray-to-disc relationship with longer visible rays and a smaller disc. Its secondary band is 0.7 of the primary width; at primary W = 4/3, the visible root R/local W is approximately 0.33 and each free straight ray is approximately 1.28 local bands long. This preserves a sun rather than a toothed gear. The solar reference's custom blend is not an exact circular-radius target. As with other stroked constructions, these ratios change with the configured width.

The compact additions use the following final painted contours. The ratios stay constant when the surrounding frame’s stroke changes:

| Compact mark |   Band W | Visible radius R | R / W | Straight arm beyond tangent |
| ------------ | -------: | ---------------: | ----: | --------------------------: |
| Schedule     | 1.333333 |             0.60 | 0.450 |                        0.94 |
| Add document | 1.333333 |             0.70 | 0.525 |                        1.33 |
| Add to grid  | 1.333333 |             0.65 | 0.488 |                        1.31 |
| Add user     | 1.333333 |             0.60 | 0.450 |                        1.19 |

These are deliberately tighter than the long reference crosses: short action arms need enough straight length to remain a plus at 12px. Their shared construction preserves the same kind of corner, with local radii adjusted to the available arm length. Standalone Add’s longer configurable crossing has R/W approximately 0.73 at W = 4/3. Unlike the fixed compact marks, its proportion varies with stroke width; inspect all supported widths before reusing it at a smaller scale.

Medical crosses have stronger bands and restrained inner fillets to preserve their conventional identity: MedicalKit uses W = 2.5, R = 0.6; Hospital uses W = 1.6, R = 0.4. Do not substitute a thin addition mark for a medical symbol. Woodland’s branch is likewise a shared fixed positive/inverse contour, with R/W = 1/3; its canopy and exposed trunk remain configurable. Other revised structural junctions, including ladder rungs, hierarchy nodes and mouse dividers, are eased only where connected members actually meet. An isolated slot does not acquire invented junctions.

For every revised family, record the reference used, the final visible proportion or transition shape, the supported widths inspected, and any compact-size adjustment. If a curve disappears beneath a thick stroke, strengthen or reconstruct the junction. If it closes a counter, crowds a neighbor or makes a plus read as a sparkle, shorten the transition or simplify the surrounding geometry. Do not apply Schedule’s dimensions to unrelated junctions.

There is no universal corner radius for the family. Natural curves, sharp outward-facing corners and softened concave joins can belong to the same icon. Classify the boundary, compare the nearest related construction and adjust to the available straight length and clearance, then check recognition at native size. A retained sharp interior corner requires the comparison evidence described in the design guide.

## Compact crosses and four-way arrows

The [23 September strength review](reviews/weld-strength-2026-09-23/README.md) retained the exposed concave sectors while reducing their local radii. At W = 4/3, the final visible radius is approximately 0.28–0.31 units in Close, Close small and Multiply, and 0.22–0.29 units in the compact Filter clear, Tag clear, Key backspace and Volume off marks. Signature's narrower local band is approximately 0.93 units with a visible radius of approximately 0.20. These are measured outcomes for these drawings, not new global tokens.

Expand and Collapse use smaller explicit shaft/head transitions with longer straight arms; their final visible radii at W = 4/3 are approximately 0.31 and 0.26 units respectively. The 0.67 reference, 1, 4/3 and 1.5 widths were compared at both native sizes. Do not infer a sharp-corner exemption from the subtler appearance at heavier weights.
