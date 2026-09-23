import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import { chromium } from "playwright";
import { optimize } from "svgo";
import { inspectDeclaredJunctions } from "./junction-paint.mjs";
import { circularCrossJunction } from "./junctions.mjs";
import { stripJunctionTraces } from "./junction-trace.mjs";
import { C, F, S, box, group, opticalScale } from "./primitives.mjs";

let browser;
let page;
before(async () => {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  page = await browser.newPage();
  await page.setContent("<!doctype html><html><body></body></html>");
});
after(async () => {
  await browser?.close();
});

const identity = { scale: 1, translateX: 0, translateY: 0 };
const members = S("M6 12H18M12 6V18");
const crossing = (radius = 1.8) =>
  members + circularCrossJunction(12, 12, radius);

// Produce final, unannotated paint using the exporter's construction scale,
// fixed reference width, baked transforms and fit compensation. The reviewer
// receives that SVG independently from the annotated construction body.
function exportFixture(body, transform = identity, allowTransforms = false) {
  const compensated = stripJunctionTraces(body).replace(
    /stroke-width="([\d.]+)"/g,
    (_, width) => `stroke-width="${(Number(width) * 0.67) / transform.scale}"`,
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><g transform="translate(${transform.translateX} ${transform.translateY}) scale(${transform.scale * 0.6666666667})">${compensated}</g></svg>`;
  const output = optimize(svg, {
    multipass: true,
    floatPrecision: 6,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            convertPathData: {
              applyTransforms: true,
              applyTransformsStroked: true,
            },
            mergePaths: false,
          },
        },
      },
    ],
  }).data;
  assert.equal(output.includes("data-salt-junctions"), false);
  if (!allowTransforms) assert.equal(output.includes("transform="), false);
  return output;
}

const inspect = (body, svg = exportFixture(body), transform = identity) =>
  page.evaluate(inspectDeclaredJunctions, { body, svg, transform });
const describe = (joins) =>
  JSON.stringify(
    (Array.isArray(joins) ? joins : [joins]).map(
      ({ sector, observations }) => ({ sector, observations }),
    ),
  );
const observationAt = (join, weight) =>
  join.observations.find(
    (observation) => Math.abs(observation.weight - weight) < 1e-6,
  );

test("declared circular sectors have final-width evidence at all four weights", async () => {
  const joins = await inspect(crossing());
  assert.equal(joins.length, 4);
  for (const join of joins) {
    assert.equal(join.referenceWidth, 0.67);
    assert.equal(join.uniform, true);
    assert.deepEqual(
      join.observations.map(({ weight }) => weight),
      [0.67, 1, 4 / 3, 1.5],
    );
    assert.ok(
      join.observations.every(({ status }) => status === "visible"),
      describe(join),
    );
    assert.ok(Math.abs(observationAt(join, 1.5).exposedRadius - 0.45) < 0.02);
  }
});

test("a small real curve becomes submerged under heavy paint", async () => {
  const joins = await inspect(crossing(0.9));
  for (const join of joins) {
    assert.equal(observationAt(join, 0.67).status, "visible");
    assert.equal(observationAt(join, 1.5).status, "submerged");
    assert.ok(observationAt(join, 1.5).exposedRadius < 0);
  }
});

test("a removed weld cannot pass because another curve is nearby", async () => {
  const body = crossing();
  for (const unjoined of [members, members + C(15, 15, 1.2)]) {
    const joins = await inspect(body, exportFixture(unjoined));
    assert.equal(joins.length, 4);
    assert.ok(
      joins.every((join) =>
        join.observations.every(({ status }) => status !== "visible"),
      ),
      describe(joins),
    );
  }
});

test("an enclosing fill reports occlusion without pretending the weld is exposed", async () => {
  const body = crossing();
  const joins = await inspect(body, exportFixture(F(box(0, 0, 24, 24)) + body));
  for (const join of joins)
    assert.ok(
      join.observations.every(({ status }) => status === "occluded"),
      describe(join),
    );
});

test("rotation and reflection preserve the local curve transform and stroke ratio", async () => {
  const body = group(
    group(crossing(), "rotate(37 12 12)"),
    "translate(24 0) scale(-1 1)",
  );
  const joins = await inspect(body);
  for (const join of joins) {
    assert.equal(join.uniform, true);
    assert.equal(join.referenceWidth, 0.67);
    assert.ok(
      join.observations.every(({ status }) => status === "visible"),
      describe(join),
    );
    assert.ok(Math.abs(observationAt(join, 1.5).exposedRadius - 0.45) < 0.02);
  }
});

test("optical scaling and export fitting compensate widths independently of geometry", async () => {
  const body = opticalScale(crossing(), 1.25);
  const transform = { scale: 1.2, translateX: -1.6, translateY: -1.6 };
  const joins = await inspect(body, exportFixture(body, transform), transform);
  for (const join of joins) {
    assert.equal(join.referenceWidth, 0.67);
    assert.ok(
      join.observations.every(({ status }) => status === "visible"),
      describe(join),
    );
    assert.ok(Math.abs(observationAt(join, 1.5).exposedRadius - 1.05) < 0.02);
  }
});

test("ordinary local scaling retains its true secondary width", async () => {
  const body = group(crossing(), "translate(2.4 2.4) scale(.8)");
  const joins = await inspect(body);
  for (const join of joins) {
    assert.equal(join.referenceWidth, 0.536);
    assert.ok(
      join.observations.every(({ status }) => status === "visible"),
      describe(join),
    );
    assert.ok(Math.abs(observationAt(join, 1.5).exposedRadius - 0.36) < 0.02);
  }
});

test("nonuniform transforms remain uncertain rather than receiving false approval", async () => {
  const body = group(crossing(), "translate(2.4 0) scale(.8 1)");
  const joins = await inspect(body, exportFixture(body, identity, true));
  for (const join of joins) {
    assert.equal(join.uniform, false);
    assert.ok(join.observations.every(({ status }) => status === "uncertain"));
  }
});

test("malformed metadata rejects and removes its temporary browser host", async () => {
  const body = '<g data-salt-junctions="not-json"><path d="M1 2Q3 2 3 4"/></g>';
  await assert.rejects(
    inspect(body, exportFixture(members)),
    /JSON|Unexpected token/,
  );
  assert.equal(await page.locator("[data-salt-junctions]").count(), 0);
});
