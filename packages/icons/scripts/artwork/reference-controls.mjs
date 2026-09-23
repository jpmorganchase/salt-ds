import { softenedStroke as S, softenedFill as F } from "./contour-profiles.mjs";
import { softenedFrame as SF } from "./contour-profiles.mjs";
import { circularCrossJunction } from "./junctions.mjs";
import { box, circ } from "./primitives.mjs";

// These controls are drawn on the normal 24-unit construction canvas. The
// comments describe painted clearances after normalization to a 16px icon.
// Primary strokes use 1.5 construction units and export at a fixed .67px.
// Keep that construction width consistent when reusing these controls.

// A bank check is a cheque: payee, amount and signature fields.
// Two evenly spaced field rows avoid a cramped header band at native sizes.
const chequeFrame = SF(box(2.25, 5.25, 19.5, 13.5));
const chequeFields = S("M4.875 9.75H12M15.375 9.75H19.125M4.875 14.25H16.5");
const chequeSolid = F(
  box(1.75, 4.75, 20.5, 14.5) +
    box(4.875, 9, 7.125, 1.5) +
    box(15.375, 9, 3.75, 1.5) +
    box(4.875, 13.5, 11.625, 1.5),
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
const phoneRadius = 0;
// A 1.25px envelope leaves a .915px gap around the fixed .67px phone stroke.
const phoneEnvelope = 1.875;
const cutLeft = phoneX - phoneEnvelope;
const cutTop = phoneY - phoneEnvelope;

// Offset the sharp painted corner at the midpoint theme width W=7/6.
// The shared 14/13 export fit puts that half-width at .8125 construction
// units. A circular relief follows that miter's outside corner; the phone
// itself remains sharp. Keep the original top/left envelope landmarks.
const phoneCornerPaintHalf = .8125;
const phoneCutRadius = phoneEnvelope - phoneCornerPaintHalf;
const phoneCornerCut = () =>
  `A${phoneCutRadius} ${phoneCutRadius} 0 0 0 ${cutLeft} ${phoneY - phoneCornerPaintHalf}`;

const monitorFrame = SF(`M${cutLeft} 16H2.25V3.5H18.75V${cutTop}`);
// Keep flat foot ends; ease joined screen/stem and stem/foot roots.
const monitorStand =
  S("M10.5 16V20.5M7.125 20.5H13.875") +
  circularCrossJunction(10.5, 16, 1.7, undefined, [
    [-1, 1],
    [1, 1],
  ]) +
  circularCrossJunction(10.5, 20.5, 1.7, undefined, [
    [-1, -1],
    [1, -1],
  ]);
const phoneFrame = box(phoneX, phoneY, 6, 13, phoneRadius);
// The phone header's centerlines are 2px apart, leaving a 1.33px cavity
// with the fixed .67px stroke. Curved junctions follow the housing reference.
const phoneHeader =
  S("M15.75 11.5H21.75") +
  circularCrossJunction(15.75, 11.5, 1.5, undefined, [
    [1, -1],
    [1, 1],
  ]) +
  circularCrossJunction(21.75, 11.5, 1.5, undefined, [
    [-1, -1],
    [-1, 1],
  ]);
const phoneHome = circ(18.75, 18.75, 0.75);
const devicesOutline =
  monitorFrame + monitorStand + SF(phoneFrame) + phoneHeader + F(phoneHome);
const devicesSolid =
  F(
    `M2.25 3.5H18.75V${cutTop}H${phoneX - phoneCornerPaintHalf}${phoneCornerCut()}V16H2.25Z`,
  ) +
  monitorFrame +
  monitorStand +
  // The exposed header shares the outline phone's housing and separator.
  F(
    `M15.75 11.5H21.75V21.5H15.75Z${phoneHome}`,
  ) +
  SF(phoneFrame) +
  phoneHeader;

export default {
  "bank-check": [chequeFrame + chequeFields, chequeSolid],
  boolean: [togglesOutline, togglesSolid],
  devices: [devicesOutline, devicesSolid],
};
