import { circ, F, S } from "./primitives.mjs";
import { softenedFrame } from "./contour-profiles.mjs";
import { circularCrossJunction } from "./junctions.mjs";

// Standalone and paired figures share head, shoulder, leg axes and baseline.
// Filling changes the head and garment only; legs retain the primary weight.
export function standingPerson(x, garment = "straight") {
  if (!["straight", "dress"].includes(garment))
    throw Error("Unknown standing garment");
  const head = circ(x, 4.5, 2.25);
  const hem = garment === "dress" ? 17.25 : 15.75;
  const torso =
    garment === "dress"
      ? `M${x - 1.5} 9.75H${x + 1.5}L${x + 4} ${hem}H${x - 4}Z`
      : `M${x - 3.75} 9.75H${x + 3.75}V${hem}H${x - 3.75}Z`;
  const headRim = S(head);
  const bodyRim = softenedFrame(torso, { radius: 1.2 });
  const legs =
    S(`M${x - 2.25} ${hem}V22.794643M${x + 2.25} ${hem}V22.794643`) +
    [x - 2.25, x + 2.25]
      .map((axis) =>
        circularCrossJunction(axis, hem, 1.2, undefined, [
          [-1, 1],
          [1, 1],
        ]),
      )
      .join("");
  return [
    headRim + bodyRim + legs,
    F(head) + F(torso) + headRim + bodyRim + legs,
  ];
}
