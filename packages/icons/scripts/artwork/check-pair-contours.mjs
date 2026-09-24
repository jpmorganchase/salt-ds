import { readFileSync } from "node:fs";
import { compareComponentContours } from "./pair-contours.mjs";
import { classifyPair, pairContracts } from "./pair-contracts.mjs";

const legacy = new Set(
  JSON.parse(
    readFileSync(
      new URL("./junction-review-legacy.json", import.meta.url),
      "utf8",
    ),
  ).exports,
);

export async function checkPairContours(page, records) {
  const byName = new Map(records.map((record) => [record.name, record]));
  const names = records
    .filter(({ name }) => name.endsWith("_solid.svg"))
    .map(({ name }) => name.replace(/_solid\.svg$/, ""))
    .sort();
  for (const name of names)
    if (!byName.has(`${name}.svg`))
      throw new Error(`Missing outline for ${name}`);
  for (const name of Object.keys(pairContracts))
    if (!names.includes(name))
      throw new Error(`Pair contract refers to missing artwork: ${name}`);
  await page.addScriptTag({
    content: `window.compareComponentContours = ${compareComponentContours.toString()};`,
  });
  const results = [];
  for (const name of names) {
    const samples = await page.evaluate(
      async ({ outline, solid }) => {
        const pixelsPerUnit = 32,
          side = 16 * pixelsPerUnit;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = side;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        const render = async (svg, weight) => {
          const markup = svg
            .replace("<svg ", '<svg style="color:black" ')
            .replace(
              /stroke-width="([\d.]+)"/g,
              (_, width) => `stroke-width="${(Number(width) * weight) / 0.67}"`,
            );
          const url = URL.createObjectURL(
            new Blob([markup], { type: "image/svg+xml" }),
          );
          try {
            const image = new Image();
            image.src = url;
            await image.decode();
            context.clearRect(0, 0, side, side);
            context.drawImage(image, 0, 0, side, side);
            const pixels = context.getImageData(0, 0, side, side).data;
            return Uint8Array.from({ length: side * side }, (_, i) =>
              pixels[i * 4 + 3] >= 128 ? 1 : 0,
            );
          } finally {
            URL.revokeObjectURL(url);
          }
        };
        const samples = [];
        for (const weight of [0.67, 1, 4 / 3, 1.5]) {
          const a = await render(outline, weight),
            b = await render(solid, weight);
          samples.push({
            weight,
            ...window.compareComponentContours(a, b, side, pixelsPerUnit),
            identicalPaint: a.every((pixel, i) => pixel === b[i]),
          });
        }
        return samples;
      },
      {
        outline: byName.get(`${name}.svg`).svg,
        solid: byName.get(`${name}_solid.svg`).svg,
      },
    );
    const missingNewContract =
      !pairContracts[name] &&
      (!legacy.has(name + ".svg") || !legacy.has(name + "_solid.svg"));
    results.push({
      name,
      status: missingNewContract ? "fail" : classifyPair(name, samples),
      contract: pairContracts[name] ?? null,
      ...(missingNewContract && {
        reason: "New pairs require a declared relationship.",
      }),
      samples,
    });
  }
  return {
    results,
    failures: results.filter(({ status }) => status === "fail"),
    needsReview: results
      .filter(({ status }) => status === "needs-review")
      .map(({ name }) => name),
  };
}
