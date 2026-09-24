import { captionHole, disabledCaptionHole } from "./caption-letterforms.mjs";
import { softenedStroke as S, softenedFill as F } from "./contour-profiles.mjs";
import { softenedRect as R, softenedFrame as SF } from "./contour-profiles.mjs";
import { standaloneAddition, weldedPlusContour } from "./additions-marks.mjs";
import { actionPerson } from "./user-actions.mjs";
import { weldedCross } from "./cross-marks.mjs";
import { enclosedEllipsis, enclosedTick } from "./enclosed-marks.mjs";
import { circularCrossJunction } from "./junctions.mjs";
import { traceJunctions } from "./junction-trace.mjs";
import { arrowRoot } from "./internal-arrow-junctions.mjs";
import { standaloneMark, withSharedMark } from "./mark-composition.mjs";
import { box, C, circ, dot, group, R as crispRect, S as stroke } from "./primitives.mjs";
import {
  angledJunction,
  radialCircleJunction,
} from "./structural-junctions.mjs";

// Authored on the shared 24-unit grid; the build normalizes these to 16 units.
const icons = {};
const put = (name, outline, solid) => {
  icons[name] = [outline, solid];
};
// Navigation controls need broad painted envelopes at 12px. Enlarge their
// coordinates while retaining the shared stroke, with room for heavier use.
const arrow = (direction) =>
  group(
    S("M1.5 12H21.375M13.875 4.5L21.375 12 13.875 19.5") +
      arrowRoot(21.375, 12, [-1, 0], 1.8),
    `rotate(${direction} 12 12)`,
  );
const chevron = (direction) =>
  group(
    S("M7.125 2.625L16.5 12 7.125 21.375") +
      angledJunction(16.5, 12, [-1, -1], [-1, 1], 2),
    `rotate(${direction} 12 12)`,
  );
// A broad page counter and a small, softly joined fold leave room for content.
const sheet = "M3.75 2.25H15.75L20.25 6.75V21.75H3.75Z";
const fold = "M15.75 2.25V6.75H20.25";
const foldCounter = "M15.75 3.75V6Q15.75 6.75 16.5 6.75H18.75Z";
const sheetOutline = () => SF(sheet + fold);
const sheetSolid = (holes = "") => F(sheet + foldCounter + holes);
const speech =
  "M3 3.75H21V17.25H9.7Q9 17.25 8.45 17.71L4.5 21V18.65A1.4 1.4 0 0 0 3.1 17.25H3Z";
const chartAxes = S("M2.25 2.25V21.75H21.75");

const briefcase = box(3, 7.5, 18, 13.5);
// The case handle is one structure: ease only its two roots above the rim.
const briefcaseHandle =
  S("M8.25 7.5V3.75H15.75V7.5") +
  [8.25, 15.75]
    .map((x) =>
      circularCrossJunction(x, 7.5, 1.8, undefined, [
        [-1, -1],
        [1, -1],
      ]),
    )
    .join("");
// Access, adding and primary navigation.
// Both treatments use the same head, wheel and seated-body landmarks.
const accessiblePose = "M10.5 8.25V13.5H16.5L19.5 19.5H22.5M10.5 9.75H16.5";
const accessibleWheel = S("M7.5 10.5A5.25 5.25 0 1 0 14.25 18");
const accessibleOutline =
  C(10.5, 4.5, 2.25) +
  SF(accessiblePose, { turns: "all" }) +
  circularCrossJunction(10.5, 9.75, 1.6, undefined, [
    [1, -1],
    [1, 1],
  ]) +
  accessibleWheel;
// Filling the head retains its rim and the whole seated pose's final frame.
put(
  "accessible",
  accessibleOutline,
  F(circ(10.5, 4.5, 2.25)) + accessibleOutline,
);
const documentAddition = weldedPlusContour(8, 9.615385, 2.692308, 4 / 3, 0.7);
put(
  "add-document",
  withSharedMark(sheetOutline(), documentAddition),
  withSharedMark(sheetSolid() + S(sheet), documentAddition, true),
);
// Tile apertures follow the reference's softened square opening, while their
// external square edges and the separate plus keep the existing landmarks.
const tileOutline = (x, y, size, reach) =>
  crispRect(x, y, size, size) +
  [
    [x, y, 1, 1],
    [x + size, y, -1, 1],
    [x, y + size, 1, -1],
    [x + size, y + size, -1, -1],
  ]
    .map(([cx, cy, dx, dy]) =>
      circularCrossJunction(cx, cy, reach, undefined, [[dx, dy]], "softened-opening"),
    )
    .join("");
const addToGridOutline =
  tileOutline(3, 3, 6.75, 1.55) +
  tileOutline(14.25, 3, 6.75, 1.55) +
  tileOutline(3, 14.25, 6.75, 1.55);
const gridAddition = weldedPlusContour(12.375, 12.375, 2.625, 4 / 3, 0.65);
put(
  "add-to-grid",
  withSharedMark(addToGridOutline, gridAddition),
  withSharedMark(
    F(
      box(3, 3, 6.75, 6.75) +
        box(14.25, 3, 6.75, 6.75) +
        box(3, 14.25, 6.75, 6.75),
    ) + addToGridOutline,
    gridAddition,
  ),
);
// This external mark participates in the silhouette's fit. Author the same
// fixed contour in construction space, compensated for the reviewed 1.217391
// fit, so the person and plus keep their established final anchors.
put(
  "add-user",
  actionPerson + F(weldedPlusContour(18.75, 11.25, 3, 1.64285753, 0.73928589)),
);
put("add", standaloneAddition());
put(
  "announcement",
  SF(
    "M3 9H8.25L19.5 4.5V18L8.25 13.5H3ZM8.25 9V13.5M5.25 13.5V20.25H9L8.25 13.5M22.5 8.25V14.25",
    { turns: "all" },
  ) +
    // Preserve the horn's angular mouth; join the grip and throat locally.
    circularCrossJunction(5.25, 13.5, 1.5, undefined, [
      [-1, 1],
      [1, 1],
    ]) +
    angledJunction(8.25, 13.5, [-1, 0], [0.75, 6.75], 1.5) +
    angledJunction(8.25, 13.5, [0.75, 6.75], [11.25, 4.5], 1.5) +
    angledJunction(8.25, 9, [-1, 0], [0, 1], 1.5) +
    angledJunction(8.25, 9, [0, 1], [11.25, -4.5], 1.5) +
    angledJunction(8.25, 13.5, [0, -1], [11.25, 4.5], 1.5) +
    circularCrossJunction(8.25, 13.5, 1.5, undefined, [[-1, -1]]),
);
put(
  "api",
  S(
    "M7.5 5.25L2.25 12 7.5 18.75M16.5 5.25L21.75 12 16.5 18.75M14.25 3.75L9.75 20.25",
  ),
);
// Repeated tiles share the inner profile, scaled to the available straight runs.
put(
  "app-switcher",
  [3.75, 10.5, 17.25]
    .flatMap((x) => [3.75, 10.5, 17.25].map((y) => R(x, y, 3, 3)))
    .join(""),
);
put("arrow-down", arrow(90));
put("arrow-left", arrow(180));
put("arrow-right", arrow(0));
put("arrow-up", arrow(-90));
put(
  "attach",
  group(
    S(
      "M8.25 16.5L15.75 9A2.25 2.25 0 0 0 12.57 5.82L4.32 14.07A4.5 4.5 0 0 0 10.68 20.43L20.43 10.68A6 6 0 0 0 11.94 2.19L4.5 9.75",
      1.5 / 0.85,
    ),
    "translate(1.8 2.1) scale(.85)",
  ),
);
// Recessed terminal shoulders are part of the battery silhouette, not a
// rectangular page corner. Ease them without rounding the external top.
const batteryShape =
  "M6.75 4.5H7.4A1.6 1.6 0 0 0 9 2.9V2.25H15V2.9A1.6 1.6 0 0 0 16.6 4.5H17.25V21.75H6.75Z";
const batteryInside = [[9, 2.25, 1, 1], [15, 2.25, -1, 1], [6.75, 4.5, 1, 1], [17.25, 4.5, -1, 1]]
  .map(([x, y, dx, dy]) => circularCrossJunction(x, y, 1.45, undefined, [[dx, dy]], "softened-opening")).join("");
const batteryShoulders = [
  {
    construction: "battery terminal shoulder",
    sector: "left",
    curve: "M7.4 4.5A1.6 1.6 0 0 0 9 2.9",
  },
  {
    construction: "battery terminal shoulder",
    sector: "right",
    curve: "M15 2.9A1.6 1.6 0 0 0 16.6 4.5",
  },
];
put(
  "battery",
  traceJunctions(SF(batteryShape) + batteryInside, batteryShoulders),
  traceJunctions(
    F(batteryShape + box(8.25, 6, 7.5, 1.5, 0.375)) + SF(batteryShape),
    batteryShoulders,
  ),
);
put(
  "build-report",
  SF(`${briefcase}M3 12H8.25M15.75 12H21`) +
    F(box(8.25, 9.75, 7.5, 4.5)) +
    circularCrossJunction(3, 12, 1.5, undefined, [
      [1, -1],
      [1, 1],
    ]) +
    circularCrossJunction(21, 12, 1.5, undefined, [
      [-1, -1],
      [-1, 1],
    ]) +
    circularCrossJunction(8.25, 12, 1.5, undefined, [
      [-1, -1],
      [-1, 1],
    ]) +
    circularCrossJunction(15.75, 12, 1.5, undefined, [
      [1, -1],
      [1, 1],
    ]) +
    briefcaseHandle,
  F(
    `${briefcase}M4.125 11.25H7.25Q8.25 11.25 8.25 10.25V9.75H15.75V10.25Q15.75 11.25 16.75 11.25H19.875V12.75H16.75Q15.75 12.75 15.75 13.75V14.25H8.25V13.75Q8.25 12.75 7.25 12.75H4.125Z`,
  ) +
    SF(briefcase) +
    briefcaseHandle,
);
const windowHoles = (x, y) =>
  [0, 7.5]
    .flatMap((dx) => [0, 6].map((dy) => box(x + dx, y + dy, 2.25, 3, 0.5)))
    .join("");
// One continuous silhouette keeps the doorway open to the ground. The lower
// jambs turn into their ground segments with locally eased inner attachments.
const buildingShape =
  "M3.75 21.75V2.25H20.25V21.75H14.25V18.85A1.6 1.6 0 0 0 12.65 17.25H11.35A1.6 1.6 0 0 0 9.75 18.85V21.75Z";
const buildingFrame =
  SF(buildingShape) +
  circularCrossJunction(9.75, 21.75, 1.5, undefined, [[-1, -1]]) +
  circularCrossJunction(14.25, 21.75, 1.5, undefined, [[1, -1]]);
put(
  "building",
  buildingFrame + F(windowHoles(7.125, 5.25)),
  F(buildingShape + windowHoles(7.125, 5.25)) + buildingFrame,
);
const officeWindows = [4.5, 9]
  .flatMap((x) => [5.25, 9.75, 14.25].map((y) => box(x, y, 2.25, 2.25, 0.375)))
  .join("");
// Inspect each exposed side of the shared ground rail, including the
// interior wall feet that remain visible only in the outline variant.
const buildingsGroundRoots = [
  [2.25, [[1, -1]]],
  [13.5, [[-1, -1], [1, -1]]],
  [16.5, [[-1, -1], [1, -1]]],
  [21.75, [[-1, -1]]],
].map(([x, sectors]) => circularCrossJunction(x, 21.75, 1.7, undefined, sectors)).join("");
put(
  "buildings",
  R(2.25, 2.25, 11.25, 19.5) +
    R(16.5, 8.25, 5.25, 13.5) +
    S("M2.25 21.75H21.75") +
    F(officeWindows + box(6.75, 18.75, 2.25, 3)) +
    buildingsGroundRoots,
  F(box(2.25, 2.25, 11.25, 19.5) + officeWindows + box(6.75, 18.75, 2.25, 3)) +
    F(box(16.5, 8.25, 5.25, 13.5)) +
    R(2.25, 2.25, 11.25, 19.5) +
    R(16.5, 8.25, 5.25, 13.5) +
    S("M2.25 21.75H21.75") +
    buildingsGroundRoots,
);
const calculatorKeys = [7.5, 12, 16.5]
  .flatMap((x) => [12.75, 17.25].map((y) => box(x - 0.75, y - 0.75, 1.5, 1.5)))
  .join("");
put(
  "calculator",
  R(4.5, 2.25, 15, 19.5) +
    R(7.5, 5.25, 9, 3) +
    // Ease only the small display counter; keep its outside rectangle crisp.
    [
      [7.5, 5.25, 1, 1],
      [16.5, 5.25, -1, 1],
      [7.5, 8.25, 1, -1],
      [16.5, 8.25, -1, -1],
    ]
      .map(([x, y, dx, dy]) =>
        circularCrossJunction(x, y, 1.35, undefined, [[dx, dy]]),
      )
      .join("") +
    F(calculatorKeys),
  F(box(4.5, 2.25, 15, 19.5) + box(7.5, 5.25, 9, 3, 0.5) + calculatorKeys) +
    R(4.5, 2.25, 15, 19.5),
);
// Radius-1.8 receiver roots are tangent to the shared inner bowl, rather
// than short quadratics that become sharp under the themed stroke. Both
// surfaces retain this rim so their painted silhouettes stay aligned.
const handset =
  "M5.25 2.25L9.75 7.5 7.651785 9.598215A1.8 1.8 0 0 0 7.338581 11.722251A12.1 12.1 0 0 0 12.277749 16.661419A1.8 1.8 0 0 0 14.401785 16.348215L16.5 14.25 21.75 18.75L19.5 21Q18.75 21.75 17.25 21.5Q6.25 19.75 2.5 6.75Q2.25 5.25 3 4.5Z";
put("call", S(handset), F(handset) + S(handset));
const cartOutline =
  SF("M2.25 3.75H5.25L8.25 15.75H18.75L21 6.75H6", { turns: "all", keep: [[5.25, 3.75]] }) +
  angledJunction(6, 6.75, [-3, -12], [1, 0], 1.8) +
  angledJunction(6, 6.75, [3, 12], [1, 0], 1.8) +
  C(9, 20.25, 1.5) +
  C(18, 20.25, 1.5);
put(
  "cart",
  cartOutline,
  F("M6 6.75H21L18.75 15.75H8.25Z") +
    dot(9, 20.25, 1.5) +
    dot(18, 20.25, 1.5) +
    cartOutline,
);

// Statistical vocabulary shares an open set of axes and spacious marks.
put(
  "chart-area",
  chartAxes +
    S("M5.25 12.75L9.75 8.25L14.25 11.25L20.25 3.75V18.75H5.25Z") +
    S("M5.25 15.75L9.75 13.5L14.25 15.375L20.25 10.5") +
    angledJunction(5.25, 15.75, [0, -1], [4.5, -2.25], 1.4) +
    angledJunction(5.25, 15.75, [0, 1], [4.5, -2.25], 1.4) +
    angledJunction(20.25, 10.5, [0, -1], [-6, 4.875], 1.4) +
    angledJunction(20.25, 10.5, [0, 1], [-6, 4.875], 1.4),
);
put(
  "chart-bar",
  S("M2.25 2.25V21.75") +
    F(
      box(5.25, 3.75, 16.5, 3) +
        box(5.25, 10.5, 10.5, 3) +
        box(5.25, 17.25, 13.5, 3),
    ),
);
const boxPlotRoots =
  [
    [6.75, 2.25, 1],
    [6.75, 21.75, -1],
    [17.25, 3.75, 1],
    [17.25, 21.75, -1],
    [6.75, 6.75, -1],
    [6.75, 17.25, 1],
    [17.25, 8.25, -1],
    [17.25, 18.75, 1],
  ]
    .map(([x, y, dy]) =>
      circularCrossJunction(x, y, 1.5, undefined, [
        [-1, dy],
        [1, dy],
      ]),
    )
    .join("") +
  [
    [3.75, 12, 1],
    [9.75, 12, -1],
    [14.25, 13.5, 1],
    [20.25, 13.5, -1],
  ]
    .map(([x, y, dx]) =>
      circularCrossJunction(x, y, 1.4, undefined, [
        [dx, -1],
        [dx, 1],
      ]),
    )
    .join("");
put(
  "chart-box-plot",
  S(
    "M6.75 2.25V6.75M6.75 17.25V21.75M3.75 2.25H9.75M3.75 21.75H9.75M3.75 12H9.75M17.25 3.75V8.25M17.25 18.75V21.75M14.25 3.75H20.25M14.25 21.75H20.25M14.25 13.5H20.25",
  ) +
    R(3.75, 6.75, 6, 10.5) +
    R(14.25, 8.25, 6, 10.5) +
    boxPlotRoots,
);
put(
  "chart-bubble",
  chartAxes + C(7.5, 15.75, 2.25) + C(16.5, 7.5, 4.5) + C(18.75, 17.25, 1.5),
  chartAxes +
    dot(7.5, 15.75, 2.25) +
    C(7.5, 15.75, 2.25) +
    dot(16.5, 7.5, 4.5) +
    C(16.5, 7.5, 4.5) +
    dot(18.75, 17.25, 1.5) +
    C(18.75, 17.25, 1.5),
);
// Three separated measures and their target marks stay readable at 12px.
put(
  "chart-bullet",
  S("M2.25 2.25V21.75M19.5 3V7.5M16.5 9.75V14.25M21.75 16.5V21") +
    F(
      box(5.25, 4.125, 10.5, 2.25) +
        box(5.25, 10.875, 7.5, 2.25) +
        box(5.25, 17.625, 12.75, 2.25),
    ),
);
const candleWicks =
  S("M6.75 2.25V6.75M6.75 15.75V21.75M17.25 2.25V9.75M17.25 17.25V21.75") +
  [
    [6.75, 6.75, -1],
    [6.75, 15.75, 1],
    [17.25, 9.75, -1],
    [17.25, 17.25, 1],
  ]
    .map(([x, y, dy]) =>
      circularCrossJunction(x, y, 1.6, undefined, [
        [-1, dy],
        [1, dy],
      ]),
    )
    .join("");
// Retained body edges give hollow and filled candles the same painted width.
const candleBodies = R(3.75, 6.75, 6, 9) + R(14.25, 9.75, 6, 7.5);
put(
  "chart-candlestick",
  candleWicks + candleBodies + F(box(14.25, 9.75, 6, 7.5)),
  candleWicks +
    candleBodies +
    F(box(3.75, 6.75, 6, 9) + box(14.25, 9.75, 6, 7.5)),
);
put(
  "chart-column",
  S("M2.25 21.75H21.75") +
    F(
      box(4.5, 13.5, 3, 5.25) +
        box(11.25, 8.25, 3, 10.5) +
        box(18, 2.25, 3, 16.5),
    ),
);
// Unequal filled sectors show chart proportions instead of a loading ring.
// The broad annular band and 16-degree gaps remain distinct at 12px.
put(
  "chart-donut",
  F(
    "M13.35694 2.34489A9.75 9.75 0 0 1 13.35694 21.65511L12.76545 17.44647A5.5 5.5 0 0 0 12.76545 6.55353ZM10.64306 21.65511A9.75 9.75 0 0 1 2.39812 10.30693L6.58356 11.04494A5.5 5.5 0 0 0 11.23455 17.44647ZM3.23676 7.72588A9.75 9.75 0 0 1 10.64306 2.34489L11.23455 6.55353A5.5 5.5 0 0 0 7.05663 9.58896Z",
  ),
);
// The trend and all four marker rims remain identical across the pair.
// A secondary rim keeps an open point readable at 12px; solid fills that same
// circle instead of enlarging it. Trim each segment at the marker centerline
// so the open point remains a true transparent counter at every stroke width.
const lineChartPointRadius = 1.5;
const lineChartPoints = [
  [6.5, 17.25],
  [10.5, 11.25],
  [15, 14.25],
  [20.25, 6.75],
];
const lineChartSegments = lineChartPoints
  .slice(1)
  .map(([x2, y2], index) => {
    const [x1, y1] = lineChartPoints[index];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const inset = lineChartPointRadius / Math.hypot(dx, dy);
    return `M${x1 + dx * inset} ${y1 + dy * inset}L${x2 - dx * inset} ${y2 - dy * inset}`;
  })
  .join("");
const lineChartOutline =
  chartAxes +
  S(lineChartSegments) +
  lineChartPoints
    .map(([x, y]) => S(circ(x, y, lineChartPointRadius), 1.125))
    .join("");
put(
  "chart-line",
  lineChartOutline,
  lineChartOutline +
    lineChartPoints.map(([x, y]) => dot(x, y, lineChartPointRadius)).join(""),
);
const pieSectors =
  "M10.5 3A9 9 0 1 0 21 13.5H10.5ZM13.5 2.25V10.5H21.75A9.75 9.75 0 0 0 13.5 2.25Z";
// Filling the sectors retains every arc and radial edge, including the gap.
put("chart-pie", S(pieSectors), F(pieSectors) + S(pieSectors));
const scatterPoints = [
  [7.125, 16.5],
  [9.75, 10.5],
  [15, 14.25],
  [19.5, 5.25],
];
put(
  "chart-scatter",
  chartAxes + scatterPoints.map(([x, y]) => C(x, y, 1.75)).join(""),
  chartAxes +
    scatterPoints.map(([x, y]) => dot(x, y, 1.75) + C(x, y, 1.75)).join(""),
);
put(
  "chart-stacked-bar",
  S("M2.25 2.25V21.75") +
    F(
      box(5.25, 3.75, 7.5, 3) +
        box(14.25, 3.75, 7.5, 3) +
        box(5.25, 10.5, 3, 3) +
        box(9.75, 10.5, 6, 3) +
        box(5.25, 17.25, 6, 3) +
        box(12.75, 17.25, 6, 3),
    ),
);
put(
  "chart-waterfall",
  S("M2.25 21.75H22.5") +
    F(
      box(3, 14.25, 3, 4.5) +
        box(8.25, 9.75, 3, 4.5) +
        box(13.5, 3.75, 3, 6) +
        box(19.5, 3.75, 3, 15),
    ),
);

// Conversation containers use square exteriors with open, angular tails.
// Trim the rear tail before the foreground wall. The final diagonal cap's
// nearest corner retains approximately .61 units of clearance at W=1.5;
// the foreground balloon and the rear tail tip keep their existing anchors.
const backChat = SF("M7.5 3H21.75V15L19.05 12.84");
const frontChat =
  "M2.25 6H16.5V17.25H8.95Q8.25 17.25 7.7 17.71L3.75 21V18.65A1.4 1.4 0 0 0 2.35 17.25H2.25Z";
put(
  "chat-group",
  backChat + SF(frontChat),
  backChat + F(frontChat) + SF(frontChat),
);
put("chat", SF(speech), F(speech) + SF(speech));
put(
  "chatting",
  withSharedMark(SF(speech), enclosedEllipsis),
  withSharedMark(F(speech) + SF(speech), enclosedEllipsis, true),
);
put(
  "checkmark",
  standaloneMark(enclosedTick),
  // Checkbox, Pill and Switch supply the border and clipping.
  withSharedMark(F(box(0, 0, 24, 24)), enclosedTick, true),
);
put("chevron-down", chevron(90));
put("chevron-left", chevron(180));
put("chevron-right", chevron(0));
put("chevron-up", chevron(-90));
const clockRim = C(12, 12, 9.75);
// Expand the same 2:3 hand direction about its centerline. The inverse's
// terminal plane therefore passes through the outline's (16.5, 15) tip.
const handNormalX = 1.5 / Math.sqrt(13);
const handNormalY = 2.25 / Math.sqrt(13);
const handJoinOffset = (Math.sqrt(13) - 2) / 4;
const inverseClockHands =
  `M11.25 5.25H12.75V${12 - handJoinOffset}` +
  `L${16.5 + handNormalX} ${15 - handNormalY}` +
  ` ${16.5 - handNormalX} ${15 + handNormalY}` +
  ` 11.25 ${12 + handJoinOffset}Z`;
put(
  "clock",
  clockRim + S("M12 5.25V12L16.5 15"),
  F(circ(12, 12, 9.75) + inverseClockHands) + clockRim,
);
put(
  "clone",
  SF(
    "M2.25 7.5V2.25H7.5M11.25 2.25H16.5V4.5M2.25 11.25V14.25H15.75M12 10.5L15.75 14.25L12 18M7.5 12.375V6.75H21.75V21.75H7.5V16.125",
  ) + arrowRoot(15.75, 14.25, [-1, 0], 1.55),
);
// Keep the compact dismissal smaller without losing its native-size presence.
// Keep the four roots visible without swelling the center of a simple X.
// Compensate the reduced optical frames so subtle inner curves remain exposed
// at the heavy width instead of disappearing beneath the primary stroke.
put("close", weldedCross(12, 12, 8.625, 8.625, 1.45));
put("close_small", weldedCross(12, 12, 6.9375, 6.9375, 1.4));
// Both surfaces retain the same frame and letter anchors after fitting.
const captionEdge = (0.75 * 19.5) / 14;
put(
  "closedcaption",
  R(2.25, 5.25, 19.5, 13.5) + F(captionHole),
  F(
    box(
      2.25 - captionEdge,
      5.25 - captionEdge,
      19.5 + 2 * captionEdge,
      13.5 + 2 * captionEdge,
    ) + captionHole,
  ),
);
// Clip the shared C contours to a local 1.4-unit perpendicular slash buffer.
// This preserves the curved bowls with a smaller clearance than the frame
// breaks; the final gap remains open through a primary width of 1.5.
// The filled frame follows the outline's painted edge at the fitting width.
const captionLeft = 2.25 - captionEdge;
const captionRight = 21.75 + captionEdge;
const captionTop = 5.25 - captionEdge;
const captionBottom = 18.75 + captionEdge;
const captionBuffer = 1.4 * Math.SQRT2;
const disabledCaptionSurface =
  `M${captionTop + captionBuffer} ${captionTop}H${captionRight}V${captionBottom}H${captionBottom + captionBuffer}Z` +
  `M${captionLeft} ${captionTop}H${captionTop - captionBuffer}L${captionBottom - captionBuffer} ${captionBottom}H${captionLeft}Z`;
put(
  "closedcaption-disabled",
  SF("M9.75 5.25H21.75V17.25M14.25 18.75H2.25V6.75") +
    F(disabledCaptionHole) +
    S("M3 3L21 21"),
  F(disabledCaptionSurface + disabledCaptionHole) + S("M3 3L21 21"),
);
const coffeeCup =
  "M3.75 8.25H16.5V15.75Q16.5 18.75 13.5 18.75H6.75Q3.75 18.75 3.75 15.75Z";
// Meet the handle at the cup rim instead of leaving a cramped upper root.
// Its lower attachment remains on the straight side, above the bowl curve.
const coffeeOutline =
  S(coffeeCup) +
  S(
    "M16.5 8.25H19.5A3 3 0 0 1 19.5 14.25H16.5M2.25 21.75H19.5M6.75 2.25V5.25M12.75 2.25V5.25",
  ) +
  circularCrossJunction(16.5, 8.25, 1.7, undefined, [
    [-1, 1],
    [1, 1],
  ]) +
  circularCrossJunction(16.5, 14.25, 1.5, undefined, [
    [1, -1],
    [1, 1],
  ]);
put("coffee", coffeeOutline, F(coffeeCup) + coffeeOutline);
put(
  "collapse-all-horizontal",
  S("M3 5.25L9.75 12 3 18.75M21 5.25L14.25 12 21 18.75") +
    angledJunction(9.75, 12, [-1, -1], [-1, 1], 1.8) +
    angledJunction(14.25, 12, [1, -1], [1, 1], 1.8),
);
put(
  "collapse-all",
  S("M5.25 3L12 9.75 18.75 3M5.25 21L12 14.25 18.75 21") +
    angledJunction(12, 9.75, [-1, -1], [1, -1], 1.8) +
    angledJunction(12, 14.25, [-1, 1], [1, 1], 1.8),
);
put(
  "collapse",
  stroke(
    "M3 3L9 9M3 9H9V3M21 3L15 9M15 3V9H21M3 21L9 15M3 15H9V21M21 21L15 15M15 21V15H21",
  ) +
    arrowRoot(9, 9, [-1, -1], 1.15) +
    arrowRoot(15, 9, [1, -1], 1.15) +
    arrowRoot(9, 15, [-1, 1], 1.15) +
    arrowRoot(15, 15, [1, 1], 1.15),
);
const columnChooserRows =
  "M5.25 10.5H9M5.25 14.25H9M5.25 18H9M15 10.5H18.75M15 14.25H18.75M15 18H18.75";
const columnChooserOutline =
  R(2.25, 3, 19.5, 18) +
  S("M2.25 7.5H21.75M12 7.5V21" + columnChooserRows) +
  circularCrossJunction(2.25, 7.5, 1.8, undefined, [
    [1, -1],
    [1, 1],
  ]) +
  circularCrossJunction(21.75, 7.5, 1.8, undefined, [
    [-1, -1],
    [-1, 1],
  ]) +
  circularCrossJunction(12, 7.5, 1.7, undefined, [
    [-1, 1],
    [1, 1],
  ]) +
  circularCrossJunction(12, 21, 1.7, undefined, [
    [-1, -1],
    [1, -1],
  ]);
put(
  "column-chooser",
  columnChooserOutline,
  F(box(2.25, 3, 19.5, 4.5)) + columnChooserOutline,
);
put(
  "commentary",
  SF(speech) + S("M6.75 7.5H17.25M6.75 10.5H17.25M6.75 13.5H13.5"),
  F(
    speech +
      box(6.75, 6.75, 10.5, 1.5) +
      box(6.75, 9.75, 10.5, 1.5) +
      box(6.75, 12.75, 6.75, 1.5),
  ) + SF(speech),
);
const compareRoutes =
  S(
    "M5.25 7.5V18H12M8.25 14.25L12 18 8.25 21.75M18.75 16.5V6H12M15.75 2.25L12 6 15.75 9.75",
  ) +
  arrowRoot(12, 18, [-1, 0], 1.5) +
  arrowRoot(12, 6, [1, 0], 1.5) +
  radialCircleJunction(5.25, 5.25, 2.25, 1.4, 90) +
  radialCircleJunction(18.75, 18.75, 2.25, 1.4, -90);
const compareOutline =
  C(5.25, 5.25, 2.25) + C(18.75, 18.75, 2.25) + compareRoutes;
put(
  "compare",
  compareOutline,
  dot(5.25, 5.25, 2.25) + dot(18.75, 18.75, 2.25) + compareOutline,
);
const compassNeedle = "M15.75 8.25L14.25 14.25L8.25 15.75L9.75 9.75Z";
put(
  "compass",
  C(12, 12, 9.75) + S(compassNeedle),
  F(
    circ(12, 12, 9.75) +
      compassNeedle +
      "M13.875 10.125L12.9 12.9L10.125 13.875L11.1 11.1Z",
  ),
);
const cookieShape =
  "M12 2.25A3.75 3.75 0 0 0 17.25 6.75A3.75 3.75 0 0 0 21.75 12A9.75 9.75 0 1 1 12 2.25Z";
const chips = [
  [7.5, 8.25],
  [6.75, 14.25],
  [12, 12],
  [12, 18],
  [17.25, 15.75],
];
put(
  "cookie",
  S(cookieShape) + chips.map(([x, y]) => dot(x, y, 1)).join(""),
  // Retain the bite and outer rim so both chip treatments use one frame.
  F(cookieShape + chips.map(([x, y]) => circ(x, y, 1)).join("")) +
    S(cookieShape),
);
put(
  "copy",
  SF("M8.25 2.25H20.25V17.25M3.75 6.75H15.75V21.75H3.75Z"),
  SF("M8.25 2.25H20.25V17.25") +
    F(box(3.75, 6.75, 12, 15)) +
    SF(box(3.75, 6.75, 12, 15)),
);
const creditCardFrame = R(2.25, 5.25, 19.5, 13.5);
put(
  "credit-card",
  creditCardFrame +
    S("M2.25 9.75H21.75M5.25 15H9.75") +
    circularCrossJunction(2.25, 9.75, 1.8, undefined, [
      [1, -1],
      [1, 1],
    ]) +
    circularCrossJunction(21.75, 9.75, 1.8, undefined, [
      [-1, -1],
      [-1, 1],
    ]),
  // Inset the stripe so both side rails survive; retain the shared outer rim.
  F(
    box(2.25, 5.25, 19.5, 13.5) +
      box(3.75, 8.25, 16.5, 3, 0.5) +
      box(5.25, 14.25, 4.5, 1.5),
  ) + creditCardFrame,
);
const cropsLeaves =
  "M12 11.25C7.5 11.25 5.25 9 5.25 5.25C9.75 5.25 12 7.5 12 11.25ZM12 17.25C7.5 17.25 5.25 15 5.25 11.25C9.75 11.25 12 13.5 12 17.25ZM12 8.25C12 3.75 14.25 2.25 16.5 2.25C16.5 6 15 8.25 12 8.25ZM12 14.25C12 9.75 14.25 8.25 18 8.25C18 12 15.75 14.25 12 14.25ZM12 20.25C12 15.75 14.25 14.25 18 14.25C18 18 15.75 20.25 12 20.25Z";
// Draw the outline inward from the preferred un-stroked leaf silhouette.
// Roots return to the common stem so thin SVGs retain continuous attachments.
const cropsLeafOutline =
  "M12 10.579208Q10.974174 6.1898122 5.9288516 5.9207907Q6.2758265 10.310188 12 10.579208ZM12 16.57921Q10.974174 12.189812 5.9288516 11.920791Q6.2758265 16.310188 12 16.57921ZM17.323935 14.926065Q12.979838 15.229838 12 19.573935Q17.020163 19.270163 17.323935 14.926065ZM12 13.573935Q17.020163 13.270161 17.323936 8.9260654Q12.979839 9.2298384 12 13.573935ZM12 7.55215C12 5.15 13.9 3.22984 15.82923 3.22984C15.82923 6.25 15.1 7.55215 12 7.55215Z";
put(
  "crops",
  S(cropsLeafOutline) +
    S("M12 3.75V22.5") +
    // Ease the subpixel pockets between alternating leaves and the stem.
    // These curved bridges sit inside the existing junction at theme weights.
    F(
      "M12.38 10.99Q12.59 11.03 12.58 11.24Q12.4 11.2 12.38 10.99ZM12.38 16.99Q12.59 17.03 12.58 17.24Q12.4 17.2 12.38 16.99Z",
    ),
  F(cropsLeaves) + S("M12 3.75V22.5"),
);
// Separate the lower blade at the pivot so the two cutting edges stay distinct.
const scissorContact = 3 / Math.SQRT2;
put(
  "cut",
  C(6, 6, 3) +
    C(6, 18, 3) +
    radialCircleJunction(6, 6, 3, 1.5, 45) +
    radialCircleJunction(6, 18, 3, 1.5, -45) +
    S(
      `M${6 + scissorContact} ${6 + scissorContact}L12 12M${6 + scissorContact} ${18 - scissorContact}L20.25 3.75M14.25 14.25L20.25 20.25`,
    ),
);
const moon = "M14.25 2.25A9.75 9.75 0 1 0 21.75 15.75A9 9 0 0 1 14.25 2.25Z";
put("dark", S(moon), F(moon));
const gaugeAngle = Math.atan2(-6, 5.25);
const gaugeLength = Math.hypot(5.25, 6);
const gaugePoint = (x, y) =>
  `${12 + x * Math.cos(gaugeAngle) - y * Math.sin(gaugeAngle)} ${13.5 + x * Math.sin(gaugeAngle) + y * Math.cos(gaugeAngle)}`;
const gaugeFillet = 0.9;
const gaugeHalf = 0.75;
const gaugeTangent = Math.sqrt(
  (2.25 + gaugeFillet) ** 2 - (gaugeHalf + gaugeFillet) ** 2,
);
const gaugeContactX = (2.25 * gaugeTangent) / (2.25 + gaugeFillet);
const gaugeContactY = (2.25 * (gaugeHalf + gaugeFillet)) / (2.25 + gaugeFillet);
const gaugeCounter =
  `M${gaugePoint(gaugeContactX, -gaugeContactY)}A${gaugeFillet} ${gaugeFillet} 0 0 0 ${gaugePoint(gaugeTangent, -gaugeHalf)}` +
  `L${gaugePoint(gaugeLength, -gaugeHalf)}L${gaugePoint(gaugeLength, gaugeHalf)}L${gaugePoint(gaugeTangent, gaugeHalf)}` +
  `A${gaugeFillet} ${gaugeFillet} 0 0 0 ${gaugePoint(gaugeContactX, gaugeContactY)}A2.25 2.25 0 1 1 ${gaugePoint(gaugeContactX, -gaugeContactY)}Z`;
// Detached radial ticks keep clear of the rim at every supported weight.
// The outline uses primary weight; inverse ticks match the needle counter
// width. Both variants keep the same angle, length and anchors.
const gaugeRim = S("M2.9067 18.75A10.5 10.5 0 1 1 21.0933 18.75Z");
const gaugeTicks = [180, 225, 270, 0].map((degrees) => {
  const angle = degrees * Math.PI / 180;
  const at = (r) => `${12 + r * Math.cos(angle)} ${13.5 + r * Math.sin(angle)}`;
  return S(`M${at(7.25)}L${at(4.75)}`);
}).join("");
const gaugeTickCounters = [180, 225, 270, 0].map((degrees) => {
  const angle = degrees * Math.PI / 180;
  const point = (x, y) => `${12 + x * Math.cos(angle) - y * Math.sin(angle)} ${13.5 + x * Math.sin(angle) + y * Math.cos(angle)}`;
  // Rounded negative-space corners, with a flat middle on each terminal.
  const a = 4.75, b = 7.25, half = .75, r = .25;
  return `M${point(a + r, -half)}L${point(b - r, -half)}Q${point(b, -half)} ${point(b, -half + r)}L${point(b, half - r)}Q${point(b, half)} ${point(b - r, half)}L${point(a + r, half)}Q${point(a, half)} ${point(a, half - r)}L${point(a, -half + r)}Q${point(a, -half)} ${point(a + r, -half)}Z`;
}).join("");
put(
  "dashboard",
  gaugeRim + gaugeTicks +
    S(`M${gaugePoint(2.25, 0)}L17.25 7.5`) +
    C(12, 13.5, 2.25) +
    radialCircleJunction(12, 13.5, 2.25, 1.65, (gaugeAngle * 180) / Math.PI),
  F("M2.9067 18.75A10.5 10.5 0 1 1 21.0933 18.75Z" +
    gaugeTickCounters + gaugeCounter) + gaugeRim + dot(12, 13.5, 0.75),
);
// The ellipse and vertical wall share a tangent, which can leave a long cusp.
// Join the actual cubic segment to the wall with a filled, tangent curve.
// These local contours never connect a cylinder to a foreground person.
const cylinderWallRoots = (left, right, y, drop, reach, sides = [-1, 1]) => {
  const t = 0.22,
    span = right - left;
  const endX = span * (3 * t * t - 2 * t * t * t);
  const endY = 3 * drop * t * (1 - t);
  const controlY =
    endY - ((3 * drop * (1 - 2 * t)) / (6 * span * t * (1 - t))) * endX;
  return sides
    .map((side) => {
      const origin = side === -1 ? left : right;
      const at = (x, ordinate) => `${origin - side * x} ${y + ordinate}`;
      const blend = `M${at(0, reach)}Q${at(0, controlY)} ${at(endX, endY)}`;
      const reverse = `C${at(span * t * t, drop * (2 * t - t * t))} ${at(0, drop * t)} ${at(0, 0)}Z`;
      return F(blend + reverse) + S(blend);
    })
    .join("");
};
const dbOutline = S(
  "M3.75 6.75C3.75 1.75 20.25 1.75 20.25 6.75C20.25 11.75 3.75 11.75 3.75 6.75ZM3.75 6.75V17.25C3.75 22.25 20.25 22.25 20.25 17.25V6.75M3.75 12C3.75 17 20.25 17 20.25 12",
);
put(
  "database",
  R(2.25, 2.25, 19.5, 8.25) +
    R(2.25, 13.5, 19.5, 8.25) +
    F(
      box(5.25, 5.25, 2.25, 2.25, 0.375) +
        box(9, 5.25, 2.25, 2.25, 0.375) +
        box(5.25, 16.5, 2.25, 2.25, 0.375) +
        box(9, 16.5, 2.25, 2.25, 0.375),
    ),
  F(
    box(2.25, 2.25, 19.5, 8.25) +
      box(2.25, 13.5, 19.5, 8.25) +
      box(5.25, 5.25, 2.25, 2.25, 0.375) +
      box(9, 5.25, 2.25, 2.25, 0.375) +
      box(5.25, 16.5, 2.25, 2.25, 0.375) +
      box(9, 16.5, 2.25, 2.25, 0.375),
  ) +
    R(2.25, 2.25, 19.5, 8.25) +
    R(2.25, 13.5, 19.5, 8.25),
);
// One rear cylinder and one foreground person are shared by both variants.
// Fill only the person: retaining the exact rim and rear contour preserves
// their anchors and the existing contour-following clearance at every weight.
const managerDatabase = S(
  "M2.25 5.25C2.25 1.25 18.75 1.25 18.75 5.25C18.75 5.529117 18.669659 5.788758 18.520189 6.028922M10.089143 8.246691C6.105545 8.182471 2.25 7.183575 2.25 5.25M2.25 5.25V16.5Q2.25 19.910402 6.902342 20.219243M2.25 11.25Q2.25 14.25 7.5 14.25H9.795913",
);
const managerHead = circ(15.75, 11.625, 3.375);
const managerShoulders =
  "M9.75 22.5V20.25Q9.75 18 15.75 18Q21.75 18 21.75 20.25V22.5Z";
const managerPerson = S(managerHead + managerShoulders);
const managerMiddleRoot = (() => {
  const t = 0.55,
    span = 5.25,
    drop = 3;
  const endX = span * t * t,
    endY = drop * (2 * t - t * t);
  const controlY = endY - ((drop * (1 - t)) / (span * t)) * endX;
  const blend = `M2.25 15.5Q2.25 ${11.25 + controlY} ${2.25 + endX} ${11.25 + endY}`;
  return F(blend + `Q2.25 ${11.25 + drop * t} 2.25 11.25Z`) + S(blend);
})();
const managerCylinderRoots =
  cylinderWallRoots(2.25, 18.75, 5.25, 4, 4, [-1]) + managerMiddleRoot;
put(
  "dataset-manager",
  managerDatabase + managerCylinderRoots + managerPerson,
  managerDatabase +
    managerCylinderRoots +
    F(managerHead + managerShoulders) +
    managerPerson,
);
put(
  "dataset",
  dbOutline +
    cylinderWallRoots(3.75, 20.25, 6.75, 5, 4.4) +
    cylinderWallRoots(3.75, 20.25, 12, 5, 4.4),
);
const deleteBody = "M5.25 6L6 21.75H18L18.75 6Z";
const deleteLid =
  S("M3 6H21M9 6V2.25H15V6") +
  angledJunction(5.25, 6, [-1, 0], [0.75, 15.75], 1.5) +
  angledJunction(5.25, 6, [1, 0], [0.75, 15.75], 1.5) +
  angledJunction(18.75, 6, [-1, 0], [-0.75, 15.75], 1.5) +
  angledJunction(18.75, 6, [1, 0], [-0.75, 15.75], 1.5) +
  [9, 15]
    .map((x) =>
      circularCrossJunction(x, 6, 1.8, undefined, [
        [-1, -1],
        [1, -1],
      ]),
    )
    .join("");
put(
  "delete",
  deleteLid + SF(deleteBody + "M9.75 9.75V18M14.25 9.75V18", { turns: "all" }),
  deleteLid +
    F(deleteBody + box(9, 9.75, 1.5, 8.25) + box(13.5, 9.75, 1.5, 8.25)) +
    SF(deleteBody, { turns: "all" }),
);

// End each inner facet at the tip so its acute miter cannot extend the silhouette.
put(
  "diamond",
  S(
    "M3 8.25L6.75 3H17.25L21 8.25 12 21ZM3 8.25H21M8.25 8.25L12 21M15.75 8.25L12 21M8.25 8.25L10.5 3M15.75 8.25L13.5 3",
  ) +
    angledJunction(3, 8.25, [3.75, -5.25], [1, 0], 1.35) +
    angledJunction(3, 8.25, [1, 0], [9, 12.75], 1.35) +
    angledJunction(21, 8.25, [-3.75, -5.25], [-1, 0], 1.35) +
    angledJunction(21, 8.25, [-1, 0], [-9, 12.75], 1.35) +
    [8.25, 15.75]
      .map((x) => {
        const up = [x < 12 ? 2.25 : -2.25, -5.25];
        const down = [12 - x, 12.75];
        return [-1, 1]
          .map(
            (dx) =>
              angledJunction(x, 8.25, [dx, 0], up, 1.3) +
              angledJunction(x, 8.25, [dx, 0], down, 1.3),
          )
          .join("");
      })
      .join("") +
    angledJunction(10.5, 3, [-1, 0], [-2.25, 5.25], 1.3) +
    angledJunction(10.5, 3, [1, 0], [-2.25, 5.25], 1.3) +
    angledJunction(13.5, 3, [-1, 0], [2.25, 5.25], 1.3) +
    angledJunction(13.5, 3, [1, 0], [2.25, 5.25], 1.3),
);
put("divide", S("M3.75 12H20.25") + dot(12, 5.25, 1.5) + dot(12, 18.75, 1.5));
const editablePage = SF(
  "M14.18162 2.25H3.75V21.75H15.75L20.25 17.25V9.81838" +
    "M15.75 21.75V18Q15.75 17.25 16.5 17.25H20.25",
);
const pagePencil =
  S("M12 8.25L18 2.25L21 5.25L15 11.25L11.25 12ZM16.5 3.75L19.5 6.75") +
  angledJunction(16.5, 3.75, [-1, 1], [1, 1], 1.35) +
  angledJunction(16.5, 3.75, [1, -1], [1, 1], 1.35) +
  angledJunction(19.5, 6.75, [-1, -1], [-1, 1], 1.35) +
  angledJunction(19.5, 6.75, [-1, -1], [1, -1], 1.35);
put(
  "document-draft",
  editablePage + pagePencil + S("M7.5 15H10.5M7.5 18H12.5"),
);
put("document-edit", editablePage + pagePencil);
put(
  "document-search",
  SF(`M11.64208 21.75H3.75V2.25H15.75L20.25 6.75V10.34167${fold}`) +
    S("M7.5 9.75H10.5M7.5 14.25H9") +
    C(15.75, 15.75, 4.5) +
    S("M18.93 18.93L22.5 22.5") +
    radialCircleJunction(15.75, 15.75, 4.5, 1.65, 45),
);
put(
  "document",
  sheetOutline() + S("M7.5 11.25H16.5M7.5 15.75H14.25"),
  sheetSolid(box(7.5, 10.5, 9, 1.5) + box(7.5, 15, 6.75, 1.5)),
);
put("does-not-equal", S("M2.25 8.25H21.75M2.25 15.75H21.75M16.5 3L7.5 21"));

export default icons;
