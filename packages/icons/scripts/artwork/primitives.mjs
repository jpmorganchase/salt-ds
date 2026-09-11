import { boldLetterforms, regularLetterforms } from "./letterforms.mjs";

// Construction coordinates use 24 units; output is normalized to a 16px master.
// A 1.5-unit construction stroke exports at a fixed .67px on the 16px master.
// This follows the references' 6-unit strokes on a 144px canvas.
export const weight = 1.5;
export const S = (d, width = weight) =>
  `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="butt" stroke-linejoin="miter"/>`;
export const F = (d) =>
  `<path d="${d}" fill="currentColor" fill-rule="evenodd"/>`;
export const box = (x, y, w, h, r = 0) =>
  r
    ? `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`
    : `M${x} ${y}h${w}v${h}h${-w}Z`;
export const circ = (x, y, r) =>
  `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
export const R = (x, y, w, h, r = 0) => S(box(x, y, w, h, r));
export const C = (x, y, r) => S(circ(x, y, r));
export const dot = (x, y, r = 0.8) => F(circ(x, y, r));
export const L = (x1, y1, x2, y2) => S(`M${x1} ${y1}L${x2} ${y2}`);
export const group = (body, transform) =>
  `<g transform="${transform}">${body}</g>`;
// Adjust an entire family's optical size without changing its line weights.
// Keep paired surfaces and counters together; the exporter bakes this transform.
export const opticalScale = (body, scale) =>
  group(
    body.replace(
      /stroke-width="([\d.]+)"/g,
      (_, width) => `stroke-width="${Number(width) / scale}"`,
    ),
    `translate(${12 * (1 - scale)} ${12 * (1 - scale)}) scale(${scale})`,
  );
export const slash = () => S("M3 3L21 21");
export const plus = (x = 12, y = 12, r = 3) =>
  S(`M${x - r} ${y}h${r * 2}M${x} ${y - r}v${r * 2}`);

// Labels share one typeface, natural glyph widths and a seven-unit cap metric.
// A small fixed stroke gives regular lettering its authored weight; the
// filled core preserves counters and small-size readability.
// Bold is an intentionally filled typographic cue, so its counters stay open.
export const textLabel = (text, x, y, capHeight = 7, options = {}) => {
  const {
    align = "left",
    verticalAlign = "top",
    bold = false,
    tracking = 1,
  } = options;
  const glyphs = bold ? boldLetterforms : regularLetterforms;
  let advance = 0;
  const placed = [...text].map((character) => {
    const glyph = glyphs[character];
    if (!glyph) throw new Error(`Missing icon letterform: ${character}`);
    const position = advance;
    advance += glyph.advance + tracking;
    return { glyph, position };
  });
  if (placed.length === 0) return "";
  const left = Math.min(
    ...placed.map(({ glyph, position }) => position + glyph.bounds[0]),
  );
  const right = Math.max(
    ...placed.map(({ glyph, position }) => position + glyph.bounds[2]),
  );
  const scale = capHeight / 7;
  const origin = x - (align === "center" ? (left + right) / 2 : left) * scale;
  const body = placed
    .map(({ glyph, position }) =>
      group(
        F(glyph.d) + (bold ? "" : S(glyph.d, 0.3)),
        `translate(${position} 0)`,
      ),
    )
    .join("");
  // Center the visible letterforms, including rounded-glyph overshoot.
  const top = Math.min(...placed.map(({ glyph }) => glyph.bounds[1]));
  const bottom = Math.max(...placed.map(({ glyph }) => glyph.bounds[3]));
  const originY =
    verticalAlign === "center" ? y - ((top + bottom) / 2) * scale : y;
  return group(body, `translate(${origin} ${originY}) scale(${scale})`);
};
// The italic command uses a barred I so that it remains distinct from a slash.
// Its stem and terminal weights follow the regular face; only this control
// uses the conventional barred form.
export const italicLetter = (x, top, capHeight = 16.5) => {
  // The slant is baked into this contour so no shear remains on a stroke.
  const path =
    "M1.75 0H6.35L6.1705 .7182H4.2775L2.8866 6.2818H4.7796L4.6 7H0L.1796 6.2818H2.0726L3.4635 .7182H1.5705Z";
  const scale = capHeight / 7;
  return group(
    F(path) + S(path, 0.3),
    `translate(${x - 3.175 * scale} ${top}) scale(${scale})`,
  );
};
