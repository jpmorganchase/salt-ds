import { softenedStroke as S, softenedFill as F } from "./contour-profiles.mjs";
import { softenedFrame as SF } from "./contour-profiles.mjs";
import { arrowRoot } from "./internal-arrow-junctions.mjs";
import { weldedPlusContour } from "./additions-marks.mjs";
import { circularCrossJunction } from "./junctions.mjs";
import { withSharedMark } from "./mark-composition.mjs";
import { box, circ, group, opticalScale } from "./primitives.mjs";

// Frames retain the initial design proportions. Main strokes use the 1.5-unit
// construction width; the fixed .67px export supplies the reference mass.
// Explicit branches soften concave junctions without rounding the exterior.
const squareStroke = SF;

// Calendar: broad body, open header, two bindings and eight legible dates.
const calendarFrame = squareStroke(box(2.5, 5.5, 19, 14));
const calendarDivider = S(
  "M2.5 7.5q0 2 2 2h15q2 0 2-2" + "M2.5 11.5q0-2 2-2h15q2 0 2 2",
);
const calendarPins = S("M8 3.5v4M16 3.5v4");
const calendarPinJoins = [8, 16]
  .map((x) => circularCrossJunction(x, 5.5, 1.81))
  .join("");
const dateCentersX = [5.25, 9.75, 14.25, 18.75];
const dateCentersY = [12.75, 16.75];
const dateCounters = dateCentersY
  .flatMap((y) => dateCentersX.map((x) => box(x - 1, y - 1, 2, 2)))
  .join("");
const calendarDates = F(dateCounters);
// Fill only the date field. The open header and perimeter use the same
// stroked contours in both variants, preserving matching painted edges.
const calendarSolidBody = F(box(2.5, 9.5, 19, 10) + dateCounters);

// Mobile housing: 13:20 body, shallow top compartment, curved
// separator junctions and a home point inside the main cavity.
const mobileHousing = SF(box(6, 2.5, 12, 19));
const mobileSeparator = S(
  "M6 4q0 1.75 1.75 1.75h8.5q1.75 0 1.75-1.75" +
    "M6 7.5q0-1.75 1.75-1.75h8.5q1.75 0 1.75 1.75",
);
const mobileHome = F(circ(12, 18.75, 0.75));
// The open top compartment shares the outline housing and separator.
// The taller header preserves an opening at the configured interface weights.
const mobileSolid =
  F(
    `M6 5.75H18V21.5H6Z${circ(12, 18.75, 0.75)}`,
  ) +
  mobileHousing +
  mobileSeparator;

const proposals = {
  calendar: [
    calendarFrame +
      calendarDivider +
      calendarPins +
      calendarPinJoins +
      calendarDates,
    calendarSolidBody +
      calendarFrame +
      calendarDivider +
      calendarPins +
      calendarPinJoins,
  ],
  mobile: [mobileHousing + mobileSeparator + mobileHome, mobileSolid],
};

// Scheduling an appointment keeps Calendar's complete shell and bindings.
// Replace the dates with one centered addition mark, reserving clear space
// above and below it instead of crowding an interrupted outside corner.
proposals.schedule = [
  withSharedMark(
    calendarFrame + calendarDivider + calendarPins + calendarPinJoins,
    // Fixed compact action weight preserves the same welded contour in SVG,
    // CSS masks and components; changing the frame stroke cannot turn it into
    // a thin sparkle. Flat endpoints and the existing anchor stay unchanged.
    weldedPlusContour(8, 9.8432, 2.209865, 4 / 3, 0.6),
  ),
];

// Schedule-time stays a document with a clock. The wider envelope and eased
// fold match the calibrated document family; the clock remains inside it.
const scheduleDocument = squareStroke(
  "M3.75 2.25H15.75L20.25 6.75V21.75H3.75Z",
);
const scheduleFold = SF("M15.75 2.25V6.75H20.25");
const clockFace = S(circ(12, 14, 4.5));
// Shorter secondary hands keep their tips clear of the clock face.
const clockHands = S("M12 11.55V14L13.63333 15.08889", 1.08);
proposals["schedule-time"] = [
  scheduleDocument + scheduleFold + clockFace + clockHands,
  F(
    "M3.75 2.25H15.75L20.25 6.75V21.75H3.75Z" +
      "M16.25 3.5V5.75Q16.25 6.25 16.75 6.25H19Z" +
      circ(12, 14, 4.5),
  ) +
    scheduleDocument +
    clockHands,
];

// Every panel orientation uses a square exterior. Explicit curved
// branches ease the concave rail junctions while exterior corners stay sharp.
const panelFrame = squareStroke(box(2.5, 2.5, 19, 19));
// Visible circular roots replace helpers buried beneath the frame stroke.
const panelRail =
  S("M7.5 2.5v19") +
  circularCrossJunction(7.5, 2.5, 1.8, undefined, [
    [-1, 1],
    [1, 1],
  ]) +
  circularCrossJunction(7.5, 21.5, 1.8, undefined, [
    [-1, -1],
    [1, -1],
  ]);
// Only the selected side is a filled surface; the retained exposed frame
// and divider share their stroked contours with the outline companion.
const panelSolid = F(box(2.5, 2.5, 5, 19)) + panelFrame + panelRail;
for (const operation of ["open", "close"]) {
  const arrow =
    squareStroke(
      operation === "open"
        ? "M10.5 12h7.5M14.5 8.5l3.5 3.5-3.5 3.5"
        : "M18.5 12h-7M15 8.5l-3.5 3.5 3.5 3.5",
    ) +
    arrowRoot(operation === "open" ? 18 : 11.5, 12,
      operation === "open" ? [-1, 0] : [1, 0], 1.25);
  for (const [side, angle] of [
    ["left", 0],
    ["top", 90],
    ["right", 180],
    ["bottom", 270],
  ]) {
    proposals[`panel-${operation}-${side}`] = [
      group(panelFrame + panelRail + arrow, `rotate(${angle} 12 12)`),
      group(panelSolid + arrow, `rotate(${angle} 12 12)`),
    ];
  }
}

// Keep the shared calendar frame, bindings and date field aligned in both
// variants and the scheduling action while improving their native-size footprint.
for (const name of ["calendar", "schedule"]) {
  proposals[name] = proposals[name].map((drawing) =>
    typeof drawing === "string"
      ? opticalScale(drawing, 1.1)
      : { ...drawing, body: opticalScale(drawing.body, 1.1) },
  );
}

export default proposals;
