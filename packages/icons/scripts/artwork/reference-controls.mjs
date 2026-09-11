import { box, circ, F, S } from "./primitives.mjs";

// These controls are drawn on the normal 24-unit construction canvas. The
// comments describe painted clearances after normalization to a 16px icon.
// Primary strokes use 1.5 construction units and export at a fixed .67px.
// Keep that construction width consistent when reusing these controls.

// A bank check is a cheque: header, payee, amount and signature fields.
// The outline has a 1.33px straight header cavity and 1.58px field-row gaps.
const chequeFrame = S(box(2.25, 5.25, 19.5, 13.5));
const chequeDivider = S(
  "M2.25 7.5q0 .75 .75 .75H21q.75 0 .75-.75" +
    "M2.25 9q0-.75 .75-.75H21q.75 0 .75 .75",
);
const chequeFields = S("M4.875 12H12M15.375 12H19.125M4.875 15.375H16.5");
const chequeSolid = F(
  box(1.75, 4.75, 20.5, 14.5) +
    // The reference's solid cheque separates its header from the field area.
    box(1.75, 7.75, 20.5, 1) +
    box(4.875, 11.25, 7.125, 1.5) +
    box(15.375, 11.25, 3.75, 1.5) +
    box(4.875, 14.625, 11.625, 1.5),
);

// Filled thumb discs keep one clean boundary inside each track.
// At 16px, track radius 2.75 and thumb radius 1.25 leave 1.165px clearance
// with the fixed .67px stroke. The track outlines retain 1.33px between them.
const upperTrack =
  "M6.375 2.25H17.625a4.125 4.125 0 0 1 0 8.25H6.375a4.125 4.125 0 0 1 0-8.25Z";
const lowerTrack =
  "M6.375 13.5H17.625a4.125 4.125 0 0 1 0 8.25H6.375a4.125 4.125 0 0 1 0-8.25Z";
const toggleThumbs = circ(6.375, 6.375, 1.875) + circ(17.625, 17.625, 1.875);
const togglesOutline = S(upperTrack + lowerTrack) + F(toggleThumbs);
const togglesSolid = F(
  "M6.375 1.75H17.625a4.625 4.625 0 0 1 0 9.25H6.375a4.625 4.625 0 0 1 0-9.25Z" +
    "M6.375 13H17.625a4.625 4.625 0 0 1 0 9.25H6.375a4.625 4.625 0 0 1 0-9.25Z" +
    toggleThumbs,
);

// The complete monitor, stem and foot all share x7 at 16px. Its lower edge
// and foot end at x9.25; the phone starts at x10.5. The fixed .67px phone
// outline leaves .915px of painted separation at those flat-ended stops.
const phoneX = 15.75;
const phoneY = 8.5;
const phoneRadius = 1;
// A 1.25px envelope leaves a .915px gap around the fixed .67px phone stroke.
const phoneEnvelope = 1.875;
const cutLeft = phoneX - phoneEnvelope;
const cutTop = phoneY - phoneEnvelope;

// Offset the actual quadratic phone corner along its normal. Four cubic
// segments follow the offset to within .002px; enlarging a rounded box
// would widen the diagonal gap instead of following the foreground shape.
function phoneCornerCut() {
  const sample = (t) => {
    const length = Math.hypot(t, 1 - t);
    const turn = (2 * t - 1) / length ** 3;
    return {
      x: phoneX + phoneRadius * (1 - t) ** 2 - (phoneEnvelope * t) / length,
      y: phoneY + phoneRadius * t ** 2 - (phoneEnvelope * (1 - t)) / length,
      dx: -2 * phoneRadius * (1 - t) - phoneEnvelope * (1 / length - t * turn),
      dy: 2 * phoneRadius * t + phoneEnvelope * (1 / length + (1 - t) * turn),
    };
  };
  const parts = [];
  for (let i = 0; i < 4; i++) {
    const start = sample(i / 4);
    const end = sample((i + 1) / 4);
    parts.push(
      "C" +
        [
          start.x + start.dx / 12,
          start.y + start.dy / 12,
          end.x - end.dx / 12,
          end.y - end.dy / 12,
          end.x,
          end.y,
        ]
          .map((value) => Number(value.toFixed(6)))
          .join(" "),
    );
  }
  return parts.join("");
}

const monitorFrame = S(`M${cutLeft} 16H2.25V3.5H18.75V${cutTop}`);
const monitorStand = S("M10.5 16V20.5M7.125 20.5H13.875");
const phoneFrame = box(phoneX, phoneY, 6, 13, phoneRadius);
// The phone header's centerlines are 2px apart, leaving a 1.33px cavity
// with the fixed .67px stroke. Curved junctions follow the housing reference.
const phoneHeader = S(
  "M15.75 10.75q0 .75 .75 .75H21q.75 0 .75-.75" +
    "M15.75 12.25q0-.75 .75-.75H21q.75 0 .75 .75",
);
const phoneHome = circ(18.75, 18.75, 0.75);
const devicesOutline =
  monitorFrame + monitorStand + S(phoneFrame) + phoneHeader + F(phoneHome);
const devicesSolid =
  F(
    `M1.75 3H19.25V${cutTop}H${phoneX + phoneRadius}${phoneCornerCut()}V16.5H1.75Z`,
  ) +
  S("M10.5 16.5V20.5M7.125 20.5H13.875") +
  // The exposed header shares the outline phone's housing and separator.
  F(
    `M15.75 11.5H21.75V20.5Q21.75 21.5 20.75 21.5H16.75Q15.75 21.5 15.75 20.5Z${phoneHome}`,
  ) +
  S(phoneFrame) +
  phoneHeader;

export default {
  "bank-check": [chequeFrame + chequeDivider + chequeFields, chequeSolid],
  boolean: [togglesOutline, togglesSolid],
  devices: [devicesOutline, devicesSolid],
};
