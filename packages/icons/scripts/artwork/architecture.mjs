import { softenedFrame } from "./contour-profiles.mjs";
import { circularCrossJunction } from "./junctions.mjs";
import { box, F, S } from "./primitives.mjs";

const crisp = d => softenedFrame(d, {width:1.125, radius:1.5});
const roof = "M2.5 8V6.175L12 2.545l9.5 3.63V8Z";
const plinth = box(2.5, 19, 19, 2.5);
// Broad circular runouts remain exposed below the primary roof/plinth
// stroke at W=1.5. Filled interiors prevent thin-weight pinholes between the
// fillets and the secondary column strokes.
const column = (x) =>
  S(`M${x} 8V19`, 1.125) +
  circularCrossJunction(x, 8, 1.25, 1.125, [
    [-1, 1],
    [1, 1],
  ]) +
  circularCrossJunction(x, 19, 1.25, 1.125, [
    [-1, -1],
    [1, -1],
  ]);
const arc = "M9 17.75V11a3 3 0 0 1 6 0v6.75";
const body = [4, 6.5, 9, 15, 17.5, 20].map(column).join("");
const spandrels = F("M9 8h6v3a3 3 0 0 0-6 0Z");
const outline = crisp(roof + plinth) + body + S(arc, 1.125) + spandrels;
// A filled structural mass retains the same pediment, capitals and arched void.
const solid = F(
  "M2 5.8L12 2l10 3.8v2.7h-1.25Q20.5 8.5 20.5 9.75v7.5Q20.5 18.5 21.75 18.5H22V22H2v-3.5h.25Q3.5 18.5 3.5 17.25v-7.5Q3.5 8.5 2.25 8.5H2Z" +
    box(4.5, 8.5, 1.5, 10, 0.75) +
    box(7, 8.5, 1.5, 10, 0.75) +
    box(15.5, 8.5, 1.5, 10, 0.75) +
    box(18, 8.5, 1.5, 10, 0.75) +
    "M12 8.5a2.5 2.5 0 0 1 2.5 2.5v6.75q0 .75-.75 .75h-3.5q-.75 0-.75-.75V11A2.5 2.5 0 0 1 12 8.5Z",
);
export default {
  bank: [outline, solid],
};
