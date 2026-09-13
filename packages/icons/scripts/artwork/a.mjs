import { enclosedEllipsis, enclosedTick } from "./enclosed-marks.mjs";
import { standaloneMark, withSharedMark } from "./mark-composition.mjs";
import { box, C, circ, dot, F, group, plus, R, S } from "./primitives.mjs";

// Authored on the shared 24-unit grid; the build normalizes these to 16 units.
const icons = {};
const put = (name, outline, solid) => {
  icons[name] = [outline, solid];
};
// Navigation controls need broad painted envelopes at 12px. Enlarge their
// coordinates while retaining the shared stroke, with room for heavier use.
const arrow = (direction) =>
  group(
    S("M1.5 12H21.375M13.875 4.5L21.375 12 13.875 19.5"),
    `rotate(${direction} 12 12)`,
  );
const chevron = (direction) =>
  group(S("M7.125 2.625L16.5 12 7.125 21.375"), `rotate(${direction} 12 12)`);
// A broad page counter and a small, softly joined fold leave room for content.
const sheet = "M3.75 2.25H15.75L20.25 6.75V21.75H3.75Z";
const fold = "M15.75 2.25V6Q15.75 6.75 16.5 6.75H20.25";
const foldCounter = "M15.75 3.75V6Q15.75 6.75 16.5 6.75H18.75Z";
const sheetOutline = () => S(sheet + fold);
const sheetSolid = (holes = "") => F(sheet + foldCounter + holes);
const speech = "M3 3.75H21V17.25H9L4.5 21V17.25H3Z";
const chartAxes = S("M2.25 2.25V21.75H21.75");

const personHead = C(10.5, 7, 3.25);
const personBody = S(
  "M3.75 21V18C3.75 14.75 6.75 13.5 10.5 13.5C13.25 13.5 15.5 14.25 16.5 15.75",
);
const briefcase = box(3, 7.5, 18, 13.5);
const briefcaseHandle = S("M8.25 7.5V3.75H15.75V7.5");
// Shared Open Sans C contours, expanded by 0.275 construction units on each
// side for native-size lettering. The rounded bowls remain recognizable where
// the disabled slash occludes them; active and disabled states share the glyph.
const captionHole =
  "M7.99885 9.32054q-.53725 0-.95878.1813-.41523.17854-.70493.51559-.2953.34344-.45496.83559-.1633.5034-.1633 1.14206 0 .8471.26034 1.46063.24929.58718.74031.90453.49379.31922 1.25672.31922.45494 0 .85397-.0761.41002-.0782.79829-.19659l.3552-.1083v1.28827l-.17848.0669q-.41791.15665-.87633.23216-.454.0749-1.07042.0749-1.1726 0-1.97278-.49512-.80623-.49886-1.20626-1.40634-.38898-.88232-.38898-2.06908 0-.8599.24266-1.57752.24631-.72821.72307-1.26093.48072-.53715 1.17858-.82856.69139-.28866 1.57582-.28866.57382 0 1.10774.114.53901.1151.97713.33151l.24225.11966-.5651 1.19668-.24702-.11294q-.32412-.14818-.71342-.25773-.3733-.10513-.81132-.10513m9.55 0q-.53725 0-.95878.1813-.41523.17854-.70493.51559-.2953.34344-.45496.83559-.1633.5034-.1633 1.14206 0 .8471.26034 1.46063.24929.58718.74031.90453.49379.31922 1.25672.31922.45494 0 .85397-.0761.41002-.0782.79829-.19659l.3552-.1083v1.28827l-.17848.0669q-.41791.15665-.87634.23216-.454.0749-1.07041.0749-1.1726 0-1.97278-.49512-.80623-.49886-1.20626-1.40634-.38898-.88232-.38898-2.06908 0-.8599.24266-1.57752.24631-.72821.72307-1.26093.48072-.53715 1.17859-.82856.69138-.28866 1.57581-.28866.57382 0 1.10774.114.53901.1151.97713.33151l.24226.11966-.5651 1.19668-.24703-.11294q-.32412-.14818-.71342-.25773-.3733-.10513-.81132-.10513";

// Access, adding and primary navigation.
// Both treatments use the same head, wheel and seated-body landmarks.
const accessiblePose = "M10.5 8.25V13.5H16.5L19.5 19.5H22.5M10.5 9.75H16.5";
const accessibleWheel = S("M7.5 10.5A5.25 5.25 0 1 0 14.25 18");
const accessibleOutline =
  C(10.5, 4.5, 2.25) + S(accessiblePose) + accessibleWheel;
// Filling the head retains its rim and the whole seated pose's final frame.
put(
  "accessible",
  accessibleOutline,
  F(circ(10.5, 4.5, 2.25)) + accessibleOutline,
);
put(
  "add-document",
  sheetOutline() + plus(12, 14.25, 3.75),
  sheetSolid(
    "M11.25 10.5H12.75V13.5H15.75V15H12.75V18H11.25V15H8.25V13.5H11.25Z",
  ),
);
const addToGridOutline =
  R(3, 3, 6.75, 6.75) +
  R(14.25, 3, 6.75, 6.75) +
  R(3, 14.25, 6.75, 6.75) +
  plus(17.625, 17.625, 3.375);
put(
  "add-to-grid",
  addToGridOutline,
  F(
    box(3, 3, 6.75, 6.75) +
      box(14.25, 3, 6.75, 6.75) +
      box(3, 14.25, 6.75, 6.75),
  ) + addToGridOutline,
);
put("add-user", personHead + personBody + plus(18.75, 11.25, 3));
put("add", plus(12, 12, 9.75));
put(
  "announcement",
  S(
    "M3 9H8.25L19.5 4.5V18L8.25 13.5H3ZM8.25 9V13.5M5.25 13.5V20.25H9L8.25 13.5M22.5 8.25V14.25",
  ),
);
put(
  "api",
  S(
    "M7.5 5.25L2.25 12 7.5 18.75M16.5 5.25L21.75 12 16.5 18.75M14.25 3.75L9.75 20.25",
  ),
);
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
put(
  "battery",
  S("M6.75 4.5H9V2.25H15V4.5H17.25V21.75H6.75Z"),
  F(
    `M6.75 4.5H9V2.25H15V4.5H17.25V21.75H6.75Z${box(8.25, 6, 7.5, 1.5, 0.375)}`,
  ),
);
put(
  "bookmark",
  S("M6 2.25H18V21.75L12 17.25 6 21.75Z"),
  F("M6 2.25H18V21.75L12 17.25 6 21.75Z"),
);
put(
  "build-report",
  S(`${briefcase}M3 12H8.25M15.75 12H21`) +
    F(box(8.25, 9.75, 7.5, 4.5)) +
    briefcaseHandle,
  F(
    `${briefcase}M4.125 11.25H8.25V9.75H15.75V11.25H19.875V12.75H15.75V14.25H8.25V12.75H4.125Z`,
  ) +
    S(briefcase) +
    briefcaseHandle,
);
const windowHoles = (x, y) =>
  [0, 7.5]
    .flatMap((dx) => [0, 6].map((dy) => box(x + dx, y + dy, 2.25, 3, 0.5)))
    .join("");
// The doorway has rounded top corners and opens onto the shared ground line.
const buildingDoor =
  "M9.75 21.75V18Q9.75 17.25 10.5 17.25H13.5Q14.25 17.25 14.25 18V21.75";
put(
  "building",
  R(3.75, 2.25, 16.5, 19.5) + F(windowHoles(7.125, 5.25)) + S(buildingDoor),
  F(
    `${box(3.75, 2.25, 16.5, 19.5)}${windowHoles(7.125, 5.25)}${buildingDoor}Z`,
  ) + S("M3.75 21.75H20.25"),
);
const officeWindows = [4.5, 9]
  .flatMap((x) => [5.25, 9.75, 14.25].map((y) => box(x, y, 2.25, 2.25, 0.375)))
  .join("");
put(
  "buildings",
  R(2.25, 2.25, 11.25, 19.5) +
    R(16.5, 8.25, 5.25, 13.5) +
    S("M2.25 21.75H21.75") +
    F(officeWindows + box(6.75, 18.75, 2.25, 3)),
  F(box(2.25, 2.25, 11.25, 19.5) + officeWindows + box(6.75, 18.75, 2.25, 3)) +
    F(box(16.5, 8.25, 5.25, 13.5)) +
    S("M2.25 21.75H21.75"),
);
const calculatorKeys = [7.5, 12, 16.5]
  .flatMap((x) => [12.75, 17.25].map((y) => box(x - 0.75, y - 0.75, 1.5, 1.5)))
  .join("");
put(
  "calculator",
  R(4.5, 2.25, 15, 19.5) + R(7.5, 5.25, 9, 3) + F(calculatorKeys),
  F(box(4.5, 2.25, 15, 19.5) + box(7.5, 5.25, 9, 3, 0.5) + calculatorKeys),
);
const handset =
  "M5.25 2.25L9.75 7.5 6.75 10.5Q8.75 15.25 13.5 17.25L16.5 14.25 21.75 18.75L19.5 21Q18.75 21.75 17.25 21.5Q6.25 19.75 2.5 6.75Q2.25 5.25 3 4.5Z";
put("call", S(handset), F(handset));
const cartOutline =
  S("M2.25 3.75H5.25L8.25 15.75H18.75L21 6.75H6") +
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
    S("M5.25 15.75L9.75 13.5L14.25 15.375L20.25 10.5"),
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
put(
  "chart-box-plot",
  S(
    "M6.75 2.25V6.75M6.75 17.25V21.75M3.75 2.25H9.75M3.75 21.75H9.75M3.75 12H9.75M17.25 3.75V8.25M17.25 18.75V21.75M14.25 3.75H20.25M14.25 21.75H20.25M14.25 13.5H20.25",
  ) +
    R(3.75, 6.75, 6, 10.5) +
    R(14.25, 8.25, 6, 10.5),
);
put(
  "chart-bubble",
  chartAxes + C(7.5, 15.75, 2.25) + C(16.5, 7.5, 4.5) + C(18.75, 17.25, 1.5),
  chartAxes +
    dot(7.5, 15.75, 2.25) +
    dot(16.5, 7.5, 4.5) +
    dot(18.75, 17.25, 1.5),
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
const candleWicks = S(
  "M6.75 2.25V6.75M6.75 15.75V21.75M17.25 2.25V9.75M17.25 17.25V21.75",
);
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
// Both variants mark every vertex; the first point stays clear of the axis.
// Filled nodes give the solid variant more emphasis without adding tiny counters.
const lineChart = S("M6 17.25L10.5 11.25L15 14.25L20.25 6.75");
const lineChartPoints = [
  [6, 17.25],
  [10.5, 11.25],
  [15, 14.25],
  [20.25, 6.75],
];
put(
  "chart-line",
  chartAxes +
    lineChart +
    lineChartPoints.map(([x, y]) => dot(x, y, 1.5)).join(""),
  chartAxes +
    lineChart +
    lineChartPoints.map(([x, y]) => dot(x, y, 2)).join(""),
);
put(
  "chart-pie",
  S(
    "M10.5 3A9 9 0 1 0 21 13.5H10.5ZM13.5 2.25V10.5H21.75A9.75 9.75 0 0 0 13.5 2.25Z",
  ),
  F(
    "M10.5 3A9 9 0 1 0 21 13.5H10.5ZM13.5 2.25V10.5H21.75A9.75 9.75 0 0 0 13.5 2.25Z",
  ),
);
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
const backChat = S("M7.5 3H21.75V15L18 12H16.5");
const frontChat = "M2.25 6H16.5V17.25H8.25L3.75 21V17.25H2.25Z";
put(
  "chat-group",
  backChat + S(frontChat),
  backChat + F(frontChat) + S(frontChat),
);
put("chat", S(speech), F(speech));
put(
  "chatting",
  withSharedMark(S(speech), enclosedEllipsis),
  withSharedMark(F(speech), enclosedEllipsis, true),
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
put(
  "clock",
  C(12, 12, 9.75) + S("M12 5.25V12L16.5 15"),
  F(
    circ(12, 12, 9.75) +
      "M11.25 5.25H12.75V11.6L17.1 14.4 16.2 15.6 11.25 12.4Z",
  ),
);
put(
  "clone",
  S(
    "M2.25 7.5V2.25H7.5M11.25 2.25H16.5V4.5M2.25 11.25V14.25H15.75M12 10.5L15.75 14.25L12 18M7.5 12.375V6.75H21.75V21.75H7.5V16.125",
  ),
);
// Keep the compact dismissal smaller without losing its native-size presence.
put("close", S("M3.375 3.375L20.625 20.625M20.625 3.375L3.375 20.625"));
put(
  "close_small",
  S("M5.0625 5.0625L18.9375 18.9375M18.9375 5.0625L5.0625 18.9375"),
);
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
const disabledCaptionHole =
  "M6.3701 8.35q-.65693.28885-1.11591.80171-.47676.53272-.72307 1.26093-.24266.71761-.24266 1.57752 0 1.18676.38898 2.06908.40003.90748 1.20626 1.40634.80019.49512 1.97278.49512.61642 0 1.07042-.0749.45842-.07551.87633-.23216l.17848-.0669v-1.28827l-.3552.1083q-.38827.11838-.7983.19659-.39902.0761-.85396.0761-.76293 0-1.25672-.31922-.49102-.31735-.7403-.90453-.26034-.61354-.26034-1.46063 0-.63865.16329-1.14206.15966-.49215.45496-.8356.2897-.33704.70493-.51559.1723-.0741.36394-.11792zm11.5555 7.5957q.30044-.01852.5513-.0599.45842-.07551.87633-.23216l.17848-.0669v-1.28827l-.3552.1083q-.38827.11838-.7983.19659-.39902.0761-.85396.0761-.63848 0-1.08846-.22357zm-2.31622-2.31622q-.04392-.08371-.08216-.17377-.26033-.61354-.26033-1.46063 0-.63865.16329-1.14206.15966-.49215.45496-.8356.2897-.33704.70493-.51559.42153-.18129.95878-.18129.43803 0 .81132.10513.3893.10955.71342.25773l.24702.11294.5651-1.19668-.24225-.11966q-.43812-.21641-.97713-.33152-.53392-.114-1.10774-.114-.88443 0-1.57581.28867-.69787.2914-1.1786.82856-.47675.53272-.72306 1.26093-.22417.66295-.24125 1.44733z";
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
  S("M9.75 5.25H21.75V17.25M14.25 18.75H2.25V6.75") +
    F(disabledCaptionHole) +
    S("M3 3L21 21"),
  F(disabledCaptionSurface + disabledCaptionHole) + S("M3 3L21 21"),
);
put(
  "coffee",
  S(
    "M3.75 8.25H16.5V15.75Q16.5 18.75 13.5 18.75H6.75Q3.75 18.75 3.75 15.75ZM16.5 9H19.5A3 3 0 0 1 19.5 15H16.5M2.25 21.75H19.5M6.75 2.25V5.25M12.75 2.25V5.25",
  ),
  F("M3.75 8.25H16.5V15.75Q16.5 18.75 13.5 18.75H6.75Q3.75 18.75 3.75 15.75Z") +
    S(
      "M16.5 9H19.5A3 3 0 0 1 19.5 15H16.5M2.25 21.75H19.5M6.75 2.25V5.25M12.75 2.25V5.25",
    ),
);
put(
  "collapse-all-horizontal",
  S("M3 5.25L9.75 12 3 18.75M21 5.25L14.25 12 21 18.75"),
);
put("collapse-all", S("M5.25 3L12 9.75 18.75 3M5.25 21L12 14.25 18.75 21"));
put(
  "collapse",
  S(
    "M3 3L9 9M3 9H9V3M21 3L15 9M15 3V9H21M3 21L9 15M3 15H9V21M21 21L15 15M15 21V15H21",
  ),
);
const columnChooserRows =
  "M5.25 10.5H9M5.25 14.25H9M5.25 18H9M15 10.5H18.75M15 14.25H18.75M15 18H18.75";
const columnChooserOutline =
  R(2.25, 3, 19.5, 18) + S("M2.25 7.5H21.75M12 7.5V21" + columnChooserRows);
put(
  "column-chooser",
  columnChooserOutline,
  F(box(2.25, 3, 19.5, 4.5)) + columnChooserOutline,
);
put(
  "commentary",
  S(speech) + S("M6.75 7.5H17.25M6.75 10.5H17.25M6.75 13.5H13.5"),
  F(
    speech +
      box(6.75, 6.75, 10.5, 1.5) +
      box(6.75, 9.75, 10.5, 1.5) +
      box(6.75, 12.75, 6.75, 1.5),
  ),
);
put(
  "compare",
  C(5.25, 5.25, 2.25) +
    C(18.75, 18.75, 2.25) +
    S(
      "M5.25 7.5V18H12M8.25 14.25L12 18 8.25 21.75M18.75 16.5V6H12M15.75 2.25L12 6 15.75 9.75",
    ),
  dot(5.25, 5.25, 2.75) +
    dot(18.75, 18.75, 2.75) +
    S(
      "M5.25 8.25V18H12M8.25 14.25L12 18 8.25 21.75M18.75 15.75V6H12M15.75 2.25L12 6 15.75 9.75",
    ),
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
  F(cookieShape + chips.map(([x, y]) => circ(x, y, 1)).join("")),
);
put(
  "copy",
  S("M8.25 2.25H20.25V17.25M3.75 6.75H15.75V21.75H3.75Z"),
  S("M8.25 2.25H20.25V17.25") +
    F(box(3.75, 6.75, 12, 15)) +
    S(box(3.75, 6.75, 12, 15)),
);
const creditCardFrame = R(2.25, 5.25, 19.5, 13.5);
put(
  "credit-card",
  creditCardFrame + S("M2.25 9.75H21.75M5.25 15H9.75"),
  // Inset the stripe so both side rails survive; retain the shared outer rim.
  F(
    box(2.25, 5.25, 19.5, 13.5) +
      box(3.75, 8.25, 16.5, 3) +
      box(5.25, 14.25, 4.5, 1.5),
  ) + creditCardFrame,
);
const cropsLeaves =
  "M12 11.25C7.5 11.25 5.25 9 5.25 5.25C9.75 5.25 12 7.5 12 11.25ZM12 17.25C7.5 17.25 5.25 15 5.25 11.25C9.75 11.25 12 13.5 12 17.25ZM12 8.25C12 3.75 14.25 2.25 16.5 2.25C16.5 6 15 8.25 12 8.25ZM12 14.25C12 9.75 14.25 8.25 18 8.25C18 12 15.75 14.25 12 14.25ZM12 20.25C12 15.75 14.25 14.25 18 14.25C18 18 15.75 20.25 12 20.25Z";
put(
  "crops",
  S(cropsLeaves) + S("M12 3.75V22.5"),
  F(cropsLeaves) + S("M12 3.75V22.5"),
);
// Separate the lower blade at the pivot so the two cutting edges stay distinct.
const scissorContact = 3 / Math.SQRT2;
put(
  "cut",
  C(6, 6, 3) +
    C(6, 18, 3) +
    S(
      `M${6 + scissorContact} ${6 + scissorContact}L12 12M${6 + scissorContact} ${18 - scissorContact}L20.25 3.75M14.25 14.25L20.25 20.25`,
    ),
);
const moon = "M14.25 2.25A9.75 9.75 0 1 0 21.75 15.75A9 9 0 0 1 14.25 2.25Z";
put("dark", S(moon), F(moon));
put(
  "dashboard",
  S("M2.9067 18.75A10.5 10.5 0 1 1 21.0933 18.75Z") +
    S("M3.75 12H6M5.25 6.75L7.5 9M12 3.75V6M20.25 12H18M13.5 11.75L17.25 7.5") +
    C(12, 13.5, 2.25),
  F(
    "M2.9067 18.75A10.5 10.5 0 1 1 21.0933 18.75Z" +
      box(3.75, 11.25, 3, 1.5, 0.375) +
      box(11.25, 4.5, 1.5, 3, 0.375) +
      box(17.25, 11.25, 3, 1.5, 0.375) +
      "M5.3 7.6L6.4 6.5L8.5 8.6L7.4 9.7Z M12 11.25A2.25 2.25 0 1 0 14.25 13.5Q14.25 13 14 12.6L18 7.5L16.8 6.6L12.9 11.4Q12.5 11.25 12 11.25Z",
  ) + dot(12, 13.5, 0.75),
);
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
  ),
);
// Balance all four complete rear caps against the unchanged head/shoulder
// paint at W=7/6, midway between the two fitted theme defaults.
put(
  "dataset-manager",
  S(
    "M2.25 5.25C2.25 1.25 18.75 1.25 18.75 5.25C18.75 5.529117 18.669659 5.788758 18.520189 6.028922M10.089143 8.246691C6.105545 8.182471 2.25 7.183575 2.25 5.25M2.25 5.25V16.5Q2.25 19.910402 6.902342 20.219243M2.25 11.25Q2.25 14.25 7.5 14.25H9.795913",
  ) +
    C(15.75, 11.625, 3.375) +
    S("M9.75 22.5V20.25Q9.75 18 15.75 18Q21.75 18 21.75 20.25V22.5Z"),
  F(
    "M2.25 5.25C2.25 1.25 18.75 1.25 18.75 5.25V8.27059Q18.19407 7.77184 17.50195 7.47909Q16.66477 7.125 15.75 7.125Q14.83523 7.125 13.99805 7.47909Q13.19029 7.82075 12.56802 8.44302Q11.94575 9.06529 11.60409 9.87305Q11.25 10.71023 11.25 11.625Q11.25 12.53977 11.60409 13.37695Q11.94575 14.18471 12.56802 14.80698Q13.19029 15.42925 13.99805 15.77091Q14.83523 16.125 15.75 16.125Q16.66477 16.125 17.50195 15.77091Q18.19407 15.47816 18.75 14.97941V17.05718Q17.46733 16.875 15.75 16.875Q12.546 16.875 10.85499 17.50913Q9.8442 17.88818 9.28416 18.51822Q8.62599 19.25866 8.625 20.24702Q2.25 20.14435 2.25 16.5V13.4329Q3.6213 15 7.5 15V13.5Q3 13.5 3 11.25H2.25ZM3.75 5.25C3.75 7.25 17.25 7.25 17.25 5.25C17.25 3.25 3.75 3.25 3.75 5.25Z",
  ) +
    dot(15.75, 11.625, 3.375) +
    F("M9.75 22.5V20.25Q9.75 18 15.75 18Q21.75 18 21.75 20.25V22.5Z"),
);
put("dataset", dbOutline);
const deleteBody = "M5.25 6L6 21.75H18L18.75 6Z";
const deleteLid = S("M3 6H21M9 6V2.25H15V6");
put(
  "delete",
  deleteLid + S(deleteBody + "M9.75 9.75V18M14.25 9.75V18"),
  deleteLid +
    F(deleteBody + box(9, 9.75, 1.5, 8.25) + box(13.5, 9.75, 1.5, 8.25)),
);

// End each inner facet at the tip so its acute miter cannot extend the silhouette.
put(
  "diamond",
  S(
    "M3 8.25L6.75 3H17.25L21 8.25 12 21ZM3 8.25H21M8.25 8.25L12 21M15.75 8.25L12 21M8.25 8.25L10.5 3M15.75 8.25L13.5 3",
  ),
);
put("divide", S("M3.75 12H20.25") + dot(12, 5.25, 1.5) + dot(12, 18.75, 1.5));
const editablePage = S(
  "M14.18162 2.25H3.75V21.75H15.75L20.25 17.25V9.81838" +
    "M15.75 21.75V18Q15.75 17.25 16.5 17.25H20.25",
);
const pagePencil = S(
  "M12 8.25L18 2.25L21 5.25L15 11.25L11.25 12ZM16.5 3.75L19.5 6.75",
);
put(
  "document-draft",
  editablePage + pagePencil + S("M7.5 15H10.5M7.5 18H12.5"),
);
put("document-edit", editablePage + pagePencil);
put(
  "document-search",
  S(`M11.64208 21.75H3.75V2.25H15.75L20.25 6.75V10.34167${fold}`) +
    S("M7.5 9.75H10.5M7.5 14.25H9") +
    C(15.75, 15.75, 4.5) +
    S("M18.93 18.93L22.5 22.5"),
);
put(
  "document",
  sheetOutline() + S("M7.5 11.25H16.5M7.5 15.75H14.25"),
  sheetSolid(box(7.5, 10.5, 9, 1.5) + box(7.5, 15, 6.75, 1.5)),
);
put("does-not-equal", S("M2.25 8.25H21.75M2.25 15.75H21.75M16.5 3L7.5 21"));

export default icons;
