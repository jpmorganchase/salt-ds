import assert from "node:assert/strict";
import test from "node:test";
import { parseContours, tangentFillet } from "./path-segments.mjs";
const near = (a, b) =>
  a.forEach((v, i) => assert.ok(Math.abs(v - b[i]) < 1e-5, `${a} != ${b}`));
test("relative, reflected and arc segments preserve endpoints", () => {
  const contours = parseContours(
    "M2 3h4v2q2 1 3 0t3 0c1 0 2 1 2 2s1 2 2 2a2 3 30 0 1 2 4",
  );
  near(contours[0].segments.at(-1).end, [18, 13]);
  for (const s of contours[0].segments) {
    near(s.at(0), s.start);
    near(s.at(1), s.end);
  }
});
test("trimming and reversing cubic and elliptical segments retains endpoint positions", () => {
  for (const d of ["M0 0C3 0 4 8 10 8", "M2 3A5 3 20 0 1 10 8"]) {
    const original = parseContours(d)[0].segments[0];
    for (const [s, t] of [
      [0.2, 0.8],
      [0.8, 0.2],
    ]) {
      const p = original.at(s),
        trim = parseContours(`M${p.join(" ")}${original.portion(s, t)}`)[0]
          .segments[0];
      near(trim.start, original.at(s));
      near(trim.end, original.at(t));
      near(trim.at(0.5), original.at((s + t) / 2));
    }
  }
});
test("line fillet is tangent and stays within its adjacent members", () => {
  const [a, b] = parseContours("M0 0H10V10")[0].segments;
  const f = tangentFillet(a, b, 1.5);
  assert.ok(f);
  assert.equal(f.radius, 1.5);
  assert.match(f.curve, /M8.5 0A1.5 1.5/);
});
test("non-tangent curve-line join gets a tangent circular transition", () => {
  const [a, b] = parseContours("M0 0C2 0 6 2 8 4H16")[0].segments;
  const f = tangentFillet(a, b, 1.5);
  assert.ok(f);
  assert.match(f.patch, /C/);
  assert.match(f.curve, /A/);
});
test("tangent curves and moveto gaps do not create a false corner", () => {
  const [a, b] = parseContours("M0 0C2 0 6 4 8 4H16")[0].segments;
  assert.equal(tangentFillet(a, b, 1.5), null);
  assert.equal(parseContours("M0 0H10M10 0V10").length, 2);
});
test("implicit fill closure preserves the global cursor for relative subsequent contours", () => {
  const c = parseContours("M1 1H10V10H1m2-5h4v3h-4", { fill: true });
  assert.equal(c.length, 2);
  near(c[1].segments[0].start, [3, 5]);
  assert.ok(c.every((c) => c.closed));
});
