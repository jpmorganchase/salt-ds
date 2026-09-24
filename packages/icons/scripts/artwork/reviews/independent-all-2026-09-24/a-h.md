# Independent A–H icon review

Reviewed all 219 exports in the frozen A–H manifest against the current generated SVGs. Each export was inspected at 12, 14 and 16 CSS pixels at DPR1 on light and dark backgrounds, with a 64px enlargement for diagnosing contours. This is an expert visual assessment, not user recognition research.

**Results:** 181 pass, 12 issue, 26 uncertain. The entry for every export is in `a-h.json`.

The clearest repair candidates are Crops and Handshake, whose identifying shapes occupy too little of the canvas at 12px; Cloud sync, whose two arrows crowd together; the two document editing states, which are nearly identical at 12px; Chart box plot, whose box/whisker details collapse; Collapse all horizontal, which resembles Close; Currency exchange, whose currency marks merge; and Chart candlestick solid, which loses the hollow/filled distinction present in its outline sibling.

The uncertain entries have specific 12px concerns that need focused component-context or recognition review before artwork changes. They include tiny modifiers inside Add document, Cloud success, Feedback, Filter clear and Hospital; dense numerals in the forward timers; and symbols whose concept depends strongly on labels, such as Build report and Group.

Evidence sheets: `sheets/a-h/sheet-01.png` through `sheet-15.png`.
