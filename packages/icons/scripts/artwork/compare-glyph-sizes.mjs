// Read-only comparison of painted glyphs at equal display size.
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const arg = process.argv.indexOf("--baseline");
if (arg < 0 || !process.argv[arg + 1])
  throw Error("Supply --baseline <git-revision>");
const git = (...args) =>
  execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  });
const baseline = git(
  "rev-parse",
  "--verify",
  process.argv[arg + 1] + "^{commit}",
).trim();
const prefix = "packages/icons/src/SVG/";
const oldNames = git("ls-tree", "-r", "--name-only", baseline, "--", prefix)
  .trim()
  .split("\n")
  .filter((n) => n.endsWith(".svg"));
const batch = execFileSync("git", ["cat-file", "--batch"], {
  cwd: root,
  input: oldNames.map((n) => baseline + ":" + n).join("\n") + "\n",
  maxBuffer: 32 * 1024 * 1024,
  windowsHide: true,
});
const original = new Map();
let cursor = 0;
for (const name of oldNames) {
  const end = batch.indexOf(10, cursor),
    header = batch.subarray(cursor, end).toString("utf8").split(" ");
  if (header[1] !== "blob") throw Error("Missing original: " + name);
  const length = Number(header[2]);
  cursor = end + 1;
  original.set(
    path.basename(name),
    batch.subarray(cursor, cursor + length).toString("utf8"),
  );
  cursor += length + 1;
}
const names = (await fs.readdir(path.join(root, prefix)))
  .filter((n) => n.endsWith(".svg"))
  .sort();
const records = await Promise.all(
  names.map(async (name) => ({
    name,
    original: original.get(name) ?? null,
    current: await fs.readFile(path.join(root, prefix, name), "utf8"),
  })),
);
const weights = [0.67, 1, 4 / 3, 1.5];
const browser = await chromium.launch({ headless: true, channel: "chrome" });
try {
  const page = await browser.newPage();
  for (const [index, record] of records.entries()) {
    record.hash = createHash("sha256").update(record.current).digest("hex");
    record.metrics = await page.evaluate(
      async ({ original, current, weights }) => {
        const side = 1024,
          scale = side / 16,
          canvas = document.createElement("canvas");
        canvas.width = canvas.height = side;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        const measure = async (svg, weight) => {
          if (!svg) return null;
          let markup = svg.replace(
            "<svg ",
            '<svg style="color:black;fill:currentColor" ',
          );
          if (weight !== null)
            markup = markup.replace(
              /stroke-width="([\d.]+)"/g,
              (_, w) => 'stroke-width="' + (Number(w) * weight) / 0.67 + '"',
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
            let left = side,
              top = side,
              right = 0,
              bottom = 0,
              ink = 0;
            for (let p = 0; p < side * side; p++) {
              const a = pixels[p * 4 + 3];
              ink += a / 255;
              if (a < 128) continue;
              const x = p % side,
                y = Math.floor(p / side);
              left = Math.min(left, x);
              right = Math.max(right, x + 1);
              top = Math.min(top, y);
              bottom = Math.max(bottom, y + 1);
            }
            if (right <= left || bottom <= top)
              throw Error("Empty painted glyph");
            return {
              bounds: [left, top, right, bottom].map((n) => n / scale),
              width: (right - left) / scale,
              height: (bottom - top) / scale,
              center: [(left + right) / 2 / scale, (top + bottom) / 2 / scale],
              inkArea: ink / scale ** 2,
            };
          } finally {
            URL.revokeObjectURL(url);
          }
        };
        return {
          original: await measure(original, null),
          current: await Promise.all(weights.map((w) => measure(current, w))),
        };
      },
      { original: record.original, current: record.current, weights },
    );
    if ((index + 1) % 100 === 0)
      console.log("Measured " + (index + 1) + "/" + records.length + " glyphs");
  }
  const matched = records.filter((r) => r.original);
  const summaries = weights.map((weight, index) => {
    const rows = matched.map((r) => {
      const a = r.metrics.original,
        b = r.metrics.current[index];
      return {
        name: r.name,
        longestSpanChangePercent:
          (Math.max(b.width, b.height) / Math.max(a.width, a.height) - 1) * 100,
        widthChangePercent: (b.width / a.width - 1) * 100,
        heightChangePercent: (b.height / a.height - 1) * 100,
        centerShift: Math.hypot(
          b.center[0] - a.center[0],
          b.center[1] - a.center[1],
        ),
        original: [a.width, a.height],
        current: [b.width, b.height],
      };
    });
    const changes = rows
      .map((r) => r.longestSpanChangePercent)
      .sort((a, b) => a - b);
    return {
      weight,
      medianLongestSpanChangePercent: changes[Math.floor(changes.length / 2)],
      moreThanTenPercentSmaller: changes.filter((n) => n < -10).length,
      moreThanTenPercentLarger: changes.filter((n) => n > 10).length,
      largestChanges: [...rows]
        .sort(
          (a, b) =>
            Math.abs(b.longestSpanChangePercent) -
            Math.abs(a.longestSpanChangePercent),
        )
        .slice(0, 25),
      rows,
    };
  });
  const report = {
    baseline,
    weights,
    coordinateSpace:
      "paint measured at equal 16px display size; source viewBoxes preserved",
    sampling: { pixelsPerUnit: 64, alphaThreshold: 128 },
    counts: {
      current: records.length,
      matched: matched.length,
      new: records.length - matched.length,
    },
    removed: [...original.keys()].filter((n) => !names.includes(n)),
    summaries,
    records,
  };
  const out = path.join(root, "dist/icon-glyph-comparison");
  await fs.mkdir(out, { recursive: true });
  await fs.writeFile(
    path.join(out, "comparison.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  const template = await fs.readFile(
    new URL("./glyph-comparison.html", import.meta.url),
    "utf8",
  );
  await fs.writeFile(
    path.join(out, "index.html"),
    template.replace("__COMPARISON_DATA__", () =>
      JSON.stringify(report).replace(/</g, "\\u003c"),
    ),
  );
  const rows = [
    "name,display_px,current_primary_width,old_width_px,old_height_px,new_width_px,new_height_px,longest_span_change_percent,center_shift_px,old_ink_area_px2,new_ink_area_px2",
  ];
  for (const [size, index] of [
    [12, 2],
    [16, 1],
  ])
    for (const r of matched) {
      const a = r.metrics.original,
        b = r.metrics.current[index],
        factor = size / 16;
      rows.push(
        [
          r.name,
          size,
          weights[index],
          a.width * factor,
          a.height * factor,
          b.width * factor,
          b.height * factor,
          (Math.max(b.width, b.height) / Math.max(a.width, a.height) - 1) * 100,
          Math.hypot(b.center[0] - a.center[0], b.center[1] - a.center[1]) *
            factor,
          a.inkArea * factor ** 2,
          b.inkArea * factor ** 2,
        ].join(","),
      );
    }
  await fs.writeFile(
    path.join(out, "measurements.csv"),
    rows.join("\n") + "\n",
  );
  console.log(
    JSON.stringify(
      {
        baseline,
        counts: report.counts,
        removed: report.removed,
        summary: summaries.map(({ rows, largestChanges, ...s }) => s),
        output: out,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
