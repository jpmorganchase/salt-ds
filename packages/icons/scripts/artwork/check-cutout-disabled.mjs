import { checkCutoutPaint } from "./check-cutout-paint.mjs";

export function checkCutoutDisabled(page, records) {
  const expected = (projection) =>
    Object.fromEntries(
      [0.67].map((weight) => [weight, 2 - (weight * (1 + projection)) / 2]),
    );
  return checkCutoutPaint(page, records, [
    {
      name: "closedcaption-disabled.svg",
      rear: "letters",
      foreground: "slash",
      probes: [
        {
          feature: "positive caption letters parallel to slash",
          region: [3, 5, 13, 11],
          // Preserve the C bowls with the reviewed compact slash clearance.
          expected: (1.4 * 2) / 3 - 0.67 / 2,
        },
      ],
    },
    {
      name: "video-disabled.svg",
      rear: "disabled-rear",
      foreground: "slash",
      probes: [
        {
          feature: "camera upper outline stop",
          region: [4.9, 2.7, 7, 4.4],
          expected: expected(Math.SQRT1_2),
        },
        {
          feature: "camera lower outline stop",
          region: [8.8, 11.6, 10.6, 13.4],
          expected: expected(Math.SQRT1_2),
        },
        {
          feature: "camera right outline stop",
          region: [9.6, 6.9, 11.3, 8.7],
          expected: expected(Math.SQRT1_2),
        },
        {
          feature: "lens lower diagonal stop",
          region: [13.5, 10.8, 15.2, 12.5],
          // The cap corner is calibrated against the unchanged axial cuts at
          // final W=7/6, then evaluated here before the retained 1.076923 fit.
          expected: Object.fromEntries(
            [0.67].map((weight) => {
              const projection = 8.25 / Math.hypot(6, 2.25) / Math.SQRT2;
              const centerDistance =
                2 + ((7 / 6) * (projection - Math.SQRT1_2)) / (2 * 1.076923);
              return [weight, centerDistance - (weight * (1 + projection)) / 2];
            }),
          ),
        },
      ],
    },
  ]);
}
