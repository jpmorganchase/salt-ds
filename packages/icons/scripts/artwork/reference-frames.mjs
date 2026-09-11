import { box, circ, F, group, opticalScale, S } from "./primitives.mjs";

// Frames retain the initial design proportions. Main strokes use the 1.5-unit
// construction width; the fixed .67px export supplies the reference mass.
// Explicit branches soften concave junctions without rounding the exterior.
const squareStroke = S;

// Calendar: broad 20×15 body, open header, two bindings, 5×3 date matrix.
const calendarFrame = squareStroke(box(2.5, 5.5, 19, 14));
const calendarDivider = S(
  "M2.5 8.75q0 .75 .75 .75h17.5q.75 0 .75-.75" +
    "M2.5 10.25q0-.75 .75-.75h17.5q.75 0 .75 .75",
);
const calendarPins = S("M8 3.5v4M16 3.5v4");
const calendarPinJoins = [8, 16]
  .map((x) =>
    S(
      "M" +
        (x - 0.75) +
        " 5.5q.75 0 .75-.75M" +
        (x + 0.75) +
        " 5.5q-.75 0-.75-.75" +
        "M" +
        (x - 0.75) +
        " 5.5q.75 0 .75 .75M" +
        (x + 0.75) +
        " 5.5q-.75 0-.75 .75",
    ),
  )
  .join("");
const dateCentersX = [5, 8.5, 12, 15.5, 19];
const dateCentersY = [12, 14.5, 17];
const dateCounters = dateCentersY
  .flatMap((y) =>
    dateCentersX.map((x) => box(x - 0.625, y - 0.625, 1.25, 1.25)),
  )
  .join("");
const calendarDates = F(dateCounters);
// Fill only the date field. The open header and perimeter use the same
// stroked contours in both variants, preserving matching painted edges.
const calendarSolidBody = F(box(2.5, 9.5, 19, 10) + dateCounters);

// Mobile housing: 13:20 body, shallow top compartment, curved
// separator junctions and a home point inside the main cavity.
const mobileHousing = S(box(6, 2.5, 12, 19, 1));
const mobileSeparator = S(
  "M6 4.75q0 .75 .75 .75h10.5q.75 0 .75-.75" +
    "M6 6.25q0-.75 .75-.75h10.5q.75 0 .75 .75",
);
const mobileHome = F(circ(12, 18.75, 0.75));
// The open top compartment shares the outline housing and separator.
// Its 2px centerline height leaves a 1.33px opening at the fixed .67px stroke.
const mobileSolid =
  F(`M6 5.5H18V20.5Q18 21.5 17 21.5H7Q6 21.5 6 20.5Z${circ(12, 18.75, 0.75)}`) +
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

// The scheduling action retains the broad header. Its open lower corner
// leaves a separate, legible addition mark at interface size.
const scheduleFrame = squareStroke("M21.5 15.625V5.5H2.5V19.5H16.125");
const scheduleDates = [12, 15.5]
  .flatMap((y) => [5, 8.5].map((x) => F(box(x - 0.625, y - 0.625, 1.25, 1.25))))
  .join("");
proposals.schedule = [
  scheduleFrame +
    calendarDivider +
    calendarPins +
    calendarPinJoins +
    scheduleDates +
    S("M14.5 17.5h7M18 14v7"),
];

// Schedule-time stays a document with a clock. The wider envelope and eased
// fold match the calibrated document family; the clock remains inside it.
const scheduleDocument = squareStroke(
  "M3.75 2.25H15.75L20.25 6.75V21.75H3.75Z",
);
const scheduleFold = S("M15.75 2.25V6Q15.75 6.75 16.5 6.75H20.25");
const clockFace = S(circ(12, 14, 4.5));
// Shorter secondary hands keep their tips clear of the clock face.
const clockHands = S("M12 11.55V14L13.63333 15.08889", 1.08);
proposals["schedule-time"] = [
  scheduleDocument + scheduleFold + clockFace + clockHands,
  F(
    "M3.75 2.25H15.75L20.25 6.75V21.75H3.75Z" +
      "M16.25 3.5V5.75Q16.25 6.25 16.75 6.25H19Z" +
      circ(12, 14, 4.5),
  ) + clockHands,
];

// Every panel orientation uses a square 20×20 exterior. Explicit curved
// branches ease the concave rail junctions while exterior corners stay sharp.
const panelFrame =
  squareStroke(box(2.5, 2.5, 19, 19)) + S(box(2.5, 2.5, 19, 19, 0.75));
const panelRail = S(
  "M7.5 2.5v19" +
    "M6.75 2.5q.75 0 .75 .75M8.25 2.5q-.75 0-.75 .75" +
    "M6.75 21.5q.75 0 .75-.75M8.25 21.5q-.75 0-.75-.75",
);
// Only the selected side is a filled surface; the retained exposed frame
// and divider share their stroked contours with the outline companion.
const panelSolid = F(box(2.5, 2.5, 5, 19)) + panelFrame + panelRail;
for (const operation of ["open", "close"]) {
  const arrow = squareStroke(
    operation === "open"
      ? "M10.5 12h7M14.5 8.5l3.5 3.5-3.5 3.5"
      : "M18.5 12h-7M15 8.5l-3.5 3.5 3.5 3.5",
  );
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
  proposals[name] = proposals[name].map((body) => opticalScale(body, 1.1));
}

export default proposals;
