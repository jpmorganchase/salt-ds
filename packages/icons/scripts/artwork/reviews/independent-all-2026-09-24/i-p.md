# Independent review: I–P exports

Reviewed all 148 exports assigned by `manifest.json` at native 12, 14 and 16px, device pixel ratio 1, on light and dark backgrounds. I rendered current generated SVGs with the supported primary widths (4/3, 8/7 and 1 respectively) and inspected four complete contact sheets. I also enlarged 34 possible problem exports to inspect contour joins and cutouts. Every file has an individual verdict in `i-p.json`; all 148 hashes still match the frozen manifest.

**Result:** 122 pass, 3 issue, 23 uncertain. The issue verdicts are the two PDF exports, whose three-letter label is hard to decipher at 12px, and Progress Todo, whose dotted ring is markedly weaker than its neighboring progress symbols at 12px. These are visual findings, not recommended changes without a focused before/after comparison.

See [native pixel evidence](./i-p-evidence.png) for the PDF and Picnic pairs, Progress Todo beside Draft and Complete, and enlarged vectors. The 12/14/16px samples are genuine DPR1 captures enlarged with nearest-neighbor pixels for inspection.

See [native pixel evidence](./i-p-evidence.png) for the PDF and Picnic pairs, Progress Todo beside Draft and Complete, and enlarged vectors. The 12/14/16px samples are genuine DPR1 captures enlarged with nearest-neighbor pixels for inspection.

The uncertain verdicts cover both Picnic exports (table compresses at 12px), Policy (page and badge are dense at 12px), the two Music Disabled exports (slash crosses a small note), both Notification Read exports (check crowds the bell shoulder), and all 16 Panel Open/Close exports (tiny internal direction arrow needs interface context to distinguish state at 12px). None of these is a confirmed geometry error. The remaining families have clear silhouettes, continuous edges and appropriately open counters in the inspected sizes.

The complete native-size sheets are [1](./i-p-sheet-1.png), [2](./i-p-sheet-2.png), [3](./i-p-sheet-3.png) and [4](./i-p-sheet-4.png). This review checks visual artwork; it does not replace blinded user recognition feedback or a live component audit.
