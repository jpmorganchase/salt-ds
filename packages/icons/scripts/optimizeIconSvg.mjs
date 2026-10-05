import { optimize } from "svgo";

/** Preserve precise joins before converting the numeric SVG to React markup. */
export function optimizeIconSvg(svg, { preserveBrandContours = false } = {}) {
  // A miter limit above SVG's default 4 identifies an intentionally acute join.
  // Rounding a closed curve can introduce a tiny closing edge and change that
  // join's direction, visibly flattening its tip. Preserve its authored path
  // data, including when the miter limit is inherited from a group or root.
  const hasSensitiveJoins = [
    ...svg.matchAll(/\bstroke-miterlimit\s*=\s*(["'])(.*?)\1/g),
  ].some(([, , value]) => Number(value) > 4);
  return optimize(svg, {
    multipass: true,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            // Keep fixed secondary widths, such as 0.5025, intact.
            cleanupNumericValues: { floatPrecision: 8 },
            // Path merging independently reserializes coordinates at 3 decimals.
            ...(hasSensitiveJoins && { mergePaths: false }),
            ...((preserveBrandContours || hasSensitiveJoins) && {
              convertPathData: false,
            }),
          },
        },
      },
      { name: "removeAttrs", params: { attrs: "(width|height)" } },
    ],
  }).data;
}
