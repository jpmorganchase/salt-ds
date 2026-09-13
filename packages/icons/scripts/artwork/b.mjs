import { figma, github, linkedin, linkedinSolid } from "./brands.mjs";
import {
  enclosedExclamation,
  enclosedInfo,
  enclosedQuestion,
} from "./enclosed-marks.mjs";
import { lockKeyhole } from "./lock-marks.mjs";
import { withSharedMark } from "./mark-composition.mjs";
import { medicalCross } from "./medical-marks.mjs";
import { numberedTimer } from "./numbered-timer.mjs";
import { box, C, circ, dot, F, group, plus, R, S } from "./primitives.mjs";

// Newly drawn pictograms. The master grid is 24 units; the publishing step
// converts it to Salt's 16-unit grid. All counters are transparent geometry.
const icons = {};
const add = (name, outline, solid) => {
  icons[name] = [outline, solid];
};
const turn = (body, angle) => group(body, `rotate(${angle} 12 12)`);
// Match the single chevrons' broad arms; stacked strokes keep clear separation
// at 12px without changing their primary weight.
const chevrons = S(
  "M2.625 2.625L12 12L21.375 2.625M2.625 11.25L12 20.625L21.375 11.25",
);
for (const [direction, angle] of [
  ["down", 0],
  ["left", 90],
  ["right", -90],
  ["up", 180],
])
  add(`double-chevron-${direction}`, turn(chevrons, angle));

add(
  "download",
  S("M12 2.25V17.25M6 11.25L12 17.25L18 11.25M3.75 18.75v3h16.5v-3"),
);
add("drag-row", S("M6 4.5H18M6 9.5H18M6 14.5H18M6 19.5H18"));
const pencil = "M4.5 15.75L16.5 3.75L20.25 7.5L8.25 19.5L3.75 20.25Z";
add(
  "edit",
  S(pencil) + S("M14.25 6L18 9.75M4.5 15.75L8.25 19.5"),
  F(
    // Split at the outline nib divider with a one-pixel transparent seam.
    "M5.0303 15.2197L14.25 6L18 9.75L8.7803 18.9697Z M4.3485 16.6591L7.3409 19.6515L3.75 20.25Z M15.3 4.95L16.5 3.75L20.25 7.5L19.05 8.7Z",
  ),
);
add("equal", S("M2.25 8.25H21.75M2.25 15.75H21.75"));
const octagon =
  "M8.25 2.75H15.75L21.25 8.25V15.75L15.75 21.25H8.25L2.75 15.75V8.25Z";
add(
  "error",
  withSharedMark(S(octagon), enclosedExclamation(4.625)),
  withSharedMark(F(octagon), enclosedExclamation(4.625), true),
);
add("expand-all-horizontal", S("M9 6L3 12L9 18M15 6L21 12L15 18"));
add("expand-all", S("M6 9L12 3L18 9M6 15L12 21L18 15"));
add(
  "expand",
  S(
    "M3.75 9V3.75H9M3.75 3.75L9.75 9.75M15 3.75H20.25V9M20.25 3.75L14.25 9.75M20.25 15V20.25H15M20.25 20.25L14.25 14.25M9 20.25H3.75V15M3.75 20.25L9.75 14.25",
  ),
);
add("exponentiation", S("M6.75 11.25L12 3.75L17.25 11.25"));
const exportShaft = "M7.5 12H21.75";
const exportHead = "M16.5 6.75L21.75 12L16.5 17.25";
const exportArrow = S(exportShaft + exportHead);
const exportBracket = S("M9 3.75H3.75V20.25H9");
add(
  "export",
  exportBracket + exportArrow,
  // The legacy Solid export retains this open-line drawing.
  exportBracket + exportArrow,
);
const star =
  "M12 2.75L14.85 8.7L21.4 9.6L16.65 14.2L17.8 20.75L12 17.7L6.2 20.75L7.35 14.2L2.6 9.6L9.15 8.7Z";
add(
  "favorite-half",
  S(star) + F("M12 2.75V17.7L6.2 20.75L7.35 14.2L2.6 9.6L9.15 8.7Z"),
);
add("favorite", S(star), F(star));
// Inset the bold star so its stroke and sharp tips stay inside the canvas.
add(
  "favorite_strong",
  S(
    "M12 4.23L14.394 9.228L19.896 9.984L15.906 13.848L16.872 19.35L12 16.788L7.128 19.35L8.094 13.848L4.104 9.984L9.606 9.228Z",
    2.25,
  ),
);
// Balance the horizontal and vertical panel caps at the W=7/6 midpoint.
const feedbackPanel =
  "M6.75 15.75L3 18.75V3H21.75V15.253408M8.938451 15.75H6.75";
const feedbackSolidPanel =
  "M6.75 15.75L3 18.75L3 3L21.75 3L21.75 15.75L20.489004 15.75M11.010996 15.75L6.75 15.75";
const feedbackText = S("M6 6.75H12M6 9.75H9.75M6 12.75H8.25");
const feedbackUser =
  "M10.5 21V19.25C10.5 17.65 12.5 16.75 15.75 16.75S21 17.65 21 19.25V21Z";
add(
  "feedback",
  S(feedbackPanel) + feedbackText + C(15.75, 11.25, 2.4) + S(feedbackUser),
  S(feedbackSolidPanel) +
    feedbackText +
    F(circ(15.75, 11.25, 2.4) + feedbackUser),
);
add("figma", figma);
// Reserve the modifier space in every state so the base funnel stays fixed.
const funnel = "M2.25 4.5H18.75L12.75 11.25V18.75L8.25 21V11.25Z";
add("filter", S(funnel), F(funnel) + S(funnel));
// Keep the full funnel recognizable, with a separate clear mark beside its stem.
const clearFunnel = funnel;
const filterClearMark = S("M16.5 14.25L22.5 20.25M22.5 14.25L16.5 20.25");
add(
  "filter-clear",
  S(clearFunnel) + filterClearMark,
  F(clearFunnel) + S(clearFunnel) + filterClearMark,
);
add("first", S("M4.5 4.5V19.5M16.5 4.5L9 12L16.5 19.5"));
const flag =
  "M5.25 4.5H11.25L14.25 7.5H20.25L17.25 12L20.25 16.5H12.75L9.75 13.5H5.25Z";
add(
  "flag",
  S(flag) + S("M5.25 2.25V21.75"),
  F(flag) + S(flag) + S("M5.25 2.25V21.75"),
);
const folder = "M3.75 20.25V4.5H9.75L12.75 7.5H20.25V20.25Z";
add(
  "folder-closed",
  S(folder) + S("M3.75 10.5H20.25"),
  F(folder + box(6, 9.75, 12, 1.5)),
);
const openFolder = "M3.75 20.25H18.75L21 10.5H6Z";
add(
  "folder-open",
  S("M3.75 20.25V4.5H9.75L12.75 7.5H18.75V10.5") + S(openFolder),
  S("M3.75 20.25V4.5H9.75L12.75 7.5H18.75V10.5") +
    F(openFolder) +
    S(openFolder),
);

for (const seconds of ["10", "15", "30", "5"])
  add(`forward-${seconds}`, numberedTimer(seconds, "forward"));

// Brand artwork keeps the supplied contours instead of the family styling.
add("github", github);
// Comparison states share the same arm lengths; the equality bar only moves
// the gesture upward. Reviewed optical targets preserve its final scale.
const comparison = (left, equality = false) => {
  const start = left ? 17.25 : 6.75;
  const apex = left ? 6.75 : 17.25;
  const y = equality ? 9.75 : 12;
  return S(
    `M${start} ${y - 6}L${apex} ${y}L${start} ${y + 6}` +
      (equality ? "M6.75 20.25H17.25" : ""),
  );
};
add("greater-than", comparison(false));
add("greater-than-equal-to", comparison(false, true));
const tiles = [
  [3.75, 3.75],
  [14.25, 3.75],
  [3.75, 14.25],
  [14.25, 14.25],
];
add(
  "grid",
  tiles.map(([x, y]) => R(x, y, 6, 6)).join(""),
  F(tiles.map(([x, y]) => box(x - 0.75, y - 0.75, 7.5, 7.5)).join("")),
);
const groupFrame = R(2.75, 2.75, 18.5, 18.5);
const groupRear = S("M12.75 10.5V6.75H6.75V12.75H10.5");
const groupFront = box(10.5, 10.5, 6.75, 6.75);
// Keep the rear contour and the foreground square's landmarks in both styles.
add(
  "group",
  groupFrame + groupRear + S(groupFront),
  groupFrame + groupRear + F(groupFront),
);
add("growth", S("M3 18.75L9 12.75L12.75 16.5L21 6.75M14.25 6.75H21V13.5"));
const bookClosed = "M6.75 3.75H20.25V20.25H6.75Z";
add(
  "guide-closed",
  S(bookClosed) +
    S(
      "M9.75 3.75V20.25M3.75 7.5H6.75M3.75 12H6.75M3.75 16.5H6.75M12.75 8.25H17.25M12.75 12.75H17.25",
    ),
  F(
    bookClosed +
      box(9, 5.25, 1.5, 13.5) +
      box(12.75, 7.5, 4.5, 1.5) +
      box(12.75, 12, 4.5, 1.5),
  ) +
    S(bookClosed) +
    S("M3.75 7.5H6.75M3.75 12H6.75M3.75 16.5H6.75"),
);
const bookOpen =
  "M12 6Q10.5 3.75 7.5 3.75H2.75V18.75H7.5Q10.5 18.75 12 21Q13.5 18.75 16.5 18.75H21.25V3.75H16.5Q13.5 3.75 12 6Z";
add(
  "guide-open",
  S(bookOpen) +
    S(
      "M12 6V21M5.75 8.25H8.75M5.75 12.75H8.75M15.25 8.25H18.25M15.25 12.75H18.25",
    ),
  F(
    bookOpen +
      "M11.25 7H12.75V18.5H11.25Z" +
      box(5, 7.5, 4.5, 1.5, 0.4) +
      box(5, 12, 4.5, 1.5, 0.4) +
      box(14.5, 7.5, 4.5, 1.5, 0.4) +
      box(14.5, 12, 4.5, 1.5, 0.4),
  ),
);
// Opposing cuffs and a continuous thumb crossover establish the clasp.
// Open finger creases avoid small enclosed loops; the solid fills the cuffs
// inside the shared cuff boundary so the clasp keeps the same fitted geometry.
const handshakeContour =
  "M4 7L7 5.5H10.5L12 7L13.5 5.5H17L20 7V14L18.8 15.8Q19.8 16.8 18.8 17.8Q17.8 18.8 16.8 17.8L16.1 17.2Q17.1 18.2 16.1 19.2Q15.1 20.2 14.1 19.2L13.4 18.6Q14.4 19.6 13.4 20.6Q12.4 21.6 11.4 20.6L4 14Z";
const handshakeThumb =
  "M12 7L9 10Q7.7 11.3 9 12.6Q10.3 13.9 11.6 12.6L13 11.2L18.8 15.8";
const handshakeCreases = "M16.1 17.2L13.5 14.9M13.4 18.6L10.8 16.3";
const handshakeCuffs = box(1, 6, 3, 8) + box(20, 6, 3, 8);
const handshakeHands =
  S(handshakeContour) + S(handshakeThumb) + S(handshakeCreases, 1.15);
add(
  "handshake",
  handshakeHands + S(handshakeCuffs),
  handshakeHands + S(handshakeCuffs) + F(handshakeCuffs),
);
const headband = "M3.75 15.75V10.5A8.25 8.25 0 0 1 20.25 10.5V15.75";
const cups = box(3.75, 12.75, 4.5, 7.5, 0.6) + box(15.75, 12.75, 4.5, 7.5, 0.6);
// Retain the cup perimeter when filling it: the headband and cup then share
// one outer edge at every configured width instead of stepping inward where
// the headband ends halfway down the cup.
add("headphones", S(headband) + S(cups), S(headband) + S(cups) + F(cups));
// Calibrate complete cut caps at W=7/6 in the fitted frame, balancing both
// theme defaults. The right band ends inside both cup surfaces.
const disabledHeadband = S(
  "M3.75 15.75V10.5A8.25 8.25 0 0 1 4.052956 8.284825M7.505351 3.581862A8.25 8.25 0 0 1 20.25 10.5V15.464882",
);
const disabledCups =
  "M4.35 12.75H7.65Q8.25 12.75 8.25 13.35V19.65Q8.25 20.25 7.65 20.25H4.35Q3.75 20.25 3.75 19.65V13.35Q3.75 12.75 4.35 12.75ZM17.216588 12.75H19.65Q20.25 12.75 20.25 13.35V15.783412";
const disabledCupFace =
  "M4.35 12.75H7.65Q8.25 12.75 8.25 13.35V19.65Q8.25 20.25 7.65 20.25H4.35Q3.75 20.25 3.75 19.65V13.35Q3.75 12.75 4.35 12.75ZM17.535118 12.75H19.65Q20.25 12.75 20.25 13.35V15.464882Z";
add(
  "headphones-disabled",
  disabledHeadband + S(disabledCups) + S("M3 3L21 21"),
  disabledHeadband + S(disabledCupFace) + F(disabledCupFace) + S("M3 3L21 21"),
);
add(
  "help-circle",
  withSharedMark(C(12, 12, 9.25), enclosedQuestion),
  withSharedMark(F(circ(12, 12, 9.5)), enclosedQuestion, true),
);
// The eye ends match the filled pupil corridor at the W=7/6 midpoint.
// The continuous left-tip bevel closes its former butt-cap seam without
// expanding the tip to a full miter. Pupil fragments remain filled geometry.
const hiddenPupil = F(
  "M15.657940864562988 12.829514503479004 11.170485496520996 8.342059135437012C11.437325477600098 8.281805038452148 11.714948654174805 8.25 12.0 8.25C14.071067810058594 8.25 15.75 9.928932189941406 15.75 12.0C15.75 12.285051345825195 15.718194961547852 12.562674522399902 15.657940864562988 12.829514503479004ZM8.25 12.0C8.25 11.714948654174805 8.281805038452148 11.437325477600098 8.342059135437012 11.170485496520996L12.829514503479004 15.657940864562988C12.562674522399902 15.718194961547852 12.285051345825195 15.75 12.0 15.75C9.928932189941406 15.75 8.25 14.071067810058594 8.25 12.0Z",
);
add(
  "hidden",
  S(
    "M5.131095 8.033556Q3.690547 9.672962 2.25 12Q8.956162 22.833031 15.662324 18.763896",
  ).replace('stroke-linejoin="miter"', 'stroke-linejoin="bevel"') +
    S(
      "M8.337676 5.236104Q15.043838 1.166969 21.75 12Q20.309453 14.327038 18.868905 15.966444",
    ) +
    hiddenPupil +
    S("M3 3L21 21"),
  F(
    "M2.25 12.0Q3.7078845500946045 9.6449556350708 5.165768623352051 7.994195461273193L7.3443827629089355 10.172809600830078C7.122077465057373 10.73879337310791 7.0 11.355140686035156 7.0 12.0C7.0 14.76142406463623 9.23857593536377 17.0 12.0 17.0C12.644859313964844 17.0 13.261205673217773 16.87792205810547 13.827190399169922 16.655616760253906L15.830855369567871 18.659282684326172Q13.91542911529541 19.875 12.0 19.875Q7.125 19.875 2.25 12.0ZM16.655616760253906 13.827190399169922C16.87792205810547 13.261205673217773 17.0 12.644859313964844 17.0 12.0C17.0 9.23857593536377 14.76142406463623 7.0 12.0 7.0C11.355140686035156 7.0 10.73879337310791 7.122077465057373 10.172809600830078 7.3443827629089355L8.169144630432129 5.340717792510986Q10.084571838378906 4.125 12.0 4.125Q16.875 4.125 21.75 12.0Q20.292118072509766 14.355039596557617 18.834230422973633 16.00580406188965L16.655616760253906 13.827190399169922Z",
  ) +
    hiddenPupil +
    S("M3 3L21 21"),
);
const childNodes = box(12.75, 9.75, 8.25, 4.5) + box(12.75, 17.25, 8.25, 4.5);
const hierarchyLinks = S("M6 9V19.5H12.75M6 12H12.75");
add(
  "hierarchy",
  R(3, 3, 6, 6) + S(childNodes) + hierarchyLinks,
  // Fill the nodes within their retained borders so the connectors do not move.
  F(box(3, 3, 6, 6) + childNodes) +
    R(3, 3, 6, 6) +
    S(childNodes) +
    hierarchyLinks,
);
add(
  "history",
  S("M3.75 8.25A9 9 0 1 1 12 21M3.75 2.75V8.25H9.25M12 6V12L16 14.66667"),
);
const umbrella = "M10 11.25Q13.5 5.75 18 8.75Q21.75 11 21 14.25Z";
// Every ray meets the circular field, as in the shared light reference.
const sunshine = S(
  "M6 2V4.125M6 7.875V10M2 6H4.125M7.875 6H10" +
    "M3.125 3.125L4.6742 4.6742M7.3258 7.3258L8.875 8.875" +
    "M3.125 8.875L4.6742 7.3258M7.3258 4.6742L8.875 3.125",
);
add(
  "holiday",
  C(6, 6, 2.25) +
    sunshine +
    S(umbrella) +
    S("M15.75 12.75L13.5 21M2.25 21H21.75"),
  dot(6, 6, 2.25) +
    sunshine +
    F(umbrella) +
    S("M15.75 12.75L13.5 21M2.25 21H21.75"),
);
const house = "M5.25 9.0203V20.25H9.75V13.5H14.25V20.25H18.75V9.0203";
add(
  "home",
  S("M2.75 11.25L12 3L21.25 11.25") + S(house),
  F(`M3 11.25L12 3L21 11.25H18.75V21H5.25V11.25Z${box(9.75, 13.5, 4.5, 7.5)}`),
);
const crossHole = "M11.25 5.25H12.75V7.5H15V9H12.75V11.25H11.25V9H9V7.5H11.25Z";
add(
  "hospital",
  R(6.75, 2.75, 10.5, 18.5) +
    plus(12, 8.25, 3) +
    S("M3 21.25H21M9 14.25H10.5M13.5 14.25H15M10.5 21V18H13.5V21"),
  F(
    box(6, 2.75, 12, 18.5) +
      crossHole +
      box(9, 13.5, 1.5, 1.5) +
      box(13.5, 13.5, 1.5, 1.5) +
      box(10.5, 18, 3, 3.25),
  ) + S("M3 21.25H21"),
);
const imagePage = "M3.75 2.25H15.75L20.25 6.75V21.75H3.75Z";
const imageFold = "M15.75 2.25V6Q15.75 6.75 16.5 6.75H20.25";
const imageFoldCounter = "M15.75 3.75V6Q15.75 6.75 16.5 6.75H18.75Z";
const imageMarks =
  circ(8.25, 11.25, 1.5) +
  "M6.75 18.75L10.125 15L12.75 17.25L15.75 13.5L18 16.125V18.75Z";
add(
  "image",
  S(imagePage + imageFold) + F(imageMarks),
  F(imagePage + imageFoldCounter + imageMarks),
);
const importShaft = "M3 12H15";
const importHead = "M10.5 7.5L15 12L10.5 16.5";
const importArrow = S(importShaft + importHead);
const importBracket = S("M9.75 3.75H20.25V20.25H9.75");
add(
  "import",
  importBracket + importArrow,
  // The legacy Solid export retains this open-line drawing.
  importBracket + importArrow,
);
const inbox = "M3.75 9.75V20.25H20.25V9.75";
const inboxNotch = "M3.75 13.5H8.25L9.75 16.5H14.25L15.75 13.5H20.25";
const inboxArrow = S("M12 2.25V12.75M7.5 8.25L12 12.75L16.5 8.25");
const inboxTray = S(inbox + inboxNotch);
add(
  "inbox",
  inboxTray + inboxArrow,
  // Keep the complete sidewalls and notch around the filled lower tray.
  // No clearance cutout crosses this border, so it must remain continuous.
  F(`${inboxNotch}V20.25H3.75Z`) + inboxTray + inboxArrow,
);
add(
  "indent",
  S(
    "M3 3.75H21M3 20.25H21M11.25 9.75H21M11.25 14.25H21M3.75 8.25L7.5 12L3.75 15.75",
  ),
);
add(
  "infinite",
  S(
    "M12 12C9.5 8.25 8 7.5 6.5 7.5C1.5 7.5 1.5 16.5 6.5 16.5C8 16.5 9.5 15.75 12 12C14.5 8.25 16 7.5 17.5 7.5C22.5 7.5 22.5 16.5 17.5 16.5C16 16.5 14.5 15.75 12 12Z",
  ),
);
add(
  "info",
  withSharedMark(R(2.25, 2.25, 19.5, 19.5), enclosedInfo),
  withSharedMark(F(box(2.25, 2.25, 19.5, 19.5)), enclosedInfo, true),
);
// Short necks and circular lobes distinguish the puzzle tabs and sockets
// from a scalloped square. Both variants share this complete silhouette.
const puzzle =
  "M4.5 4.5H10.5V3.5A2 2 0 1 1 13.5 3.5V4.5H19.5V10.5H20.5A2 2 0 1 1 20.5 13.5H19.5V19.5H13.5V18.5A2 2 0 1 0 10.5 18.5V19.5H4.5V13.5H5.5A2 2 0 1 0 5.5 10.5H4.5Z";
add("jigsaw", S(puzzle), F(puzzle));
add("key-backspace", S("M9 5.25H21V18.75H9L2.25 12Z M12 9L18 15M18 9L12 15"));
add(
  "key-capslock",
  S(
    "M3.75 11.25L12 3.75L20.25 11.25H15.75V15.75H8.25V11.25Z M8.25 20.25H15.75",
  ),
);
add(
  "key-command",
  S(
    "M8.25 8.25H5.25A3 3 0 1 1 8.25 5.25V18.75A3 3 0 1 1 5.25 15.75H18.75A3 3 0 1 1 15.75 18.75V5.25A3 3 0 1 1 18.75 8.25Z",
  ),
);
add("key-control", S("M5.25 14.25L12 7.5L18.75 14.25"));
add("key-enter", S("M20.25 5.25V14.25H3.75M9 9L3.75 14.25L9 19.5"));
add("key-option", S("M3 6.75H8.25L15.75 18.75H21M14.25 6.75H21"));
add("key-shift", S("M3.75 11.25L12 3.75L20.25 11.25H15.75V20.25H8.25V11.25Z"));
add("key-tab", S("M3 12H17.25M11.25 6L17.25 12L11.25 18M21 4.5V19.5"));
const key = "M10.4 13.6A5.25 5.25 0 1 1 13.6 10.4L21 17.8V21H17.8V18H14.8V15Z";
// The bow's arc center is approximately (8.65,8.65). A simple dot/hole
// uses that same center and avoids a second, microscopic stroked counter.
add("key", S(key) + F(circ(8.65, 8.65, 1.5)), F(key + circ(8.65, 8.65, 1.5)));
add("last", S("M19.5 4.5V19.5M7.5 4.5L15 12L7.5 19.5"));
const topLayer = "M12 2.75L21.25 7.5L12 12.25L2.75 7.5Z";
const otherLayers = S(
  "M2.75 12L12 16.75L21.25 12M2.75 16.5L12 21.25L21.25 16.5",
);
// Keep the top layer's outer perimeter so the lower layers retain the same fit.
add(
  "layers",
  S(topLayer) + otherLayers,
  F(topLayer) + S(topLayer) + otherLayers,
);
add("less-than", comparison(true));
add("less-than-equal-to", comparison(true, true));
const bulb =
  "M8.25 16.5V15.25C8.25 12.75 5.25 11.75 5.25 8.75A6.75 6.75 0 0 1 18.75 8.75C18.75 11.75 15.75 12.75 15.75 15.25V16.5Z";
add(
  "lightbulb",
  S(bulb) +
    S(
      "M8.25 19.5H15.75M10.5 22.625H13.5M12 16.5V10.5L9.75 8.25M12 10.5L14.25 8.25",
    ),
  F(
    bulb +
      "M9.25 7.75L12 10.5L14.75 7.75L15.8 8.8L12.75 11.85V16.5H11.25V11.85L8.2 8.8Z",
  ) + S("M8.25 19.5H15.75M10.5 22.625H13.5"),
);
add(
  "linked",
  S(
    "M9 7.5L11.75 4.75A5.25 5.25 0 0 1 19.25 12.25L16.5 15M15 16.5L12.25 19.25A5.25 5.25 0 0 1 4.75 11.75L7.5 9M8.25 15.75L15.75 8.25",
  ),
);
// Keep the original letters aligned across the bare and square variants.
add("linkedin", linkedin, linkedinSolid);
add(
  "list",
  S("M8.25 5.25H21M8.25 12H21M8.25 18.75H21") +
    dot(3.75, 5.25, 1) +
    dot(3.75, 12, 1) +
    dot(3.75, 18.75, 1),
);
add("loader", S("M12 2.75A9.25 9.25 0 1 1 2.75 12"));
const pin =
  "M12 21.25C10.25 19 5.25 13.2 5.25 9.75A6.75 6.75 0 0 1 18.75 9.75C18.75 13.2 13.75 19 12 21.25Z";
add("location", S(pin) + C(12, 9.75, 2.75), F(pin + circ(12, 9.75, 2.75)));
const lockShackle = S("M6.75 10.5V7.5A5.25 5.25 0 0 1 17.25 7.5V10.5");
add(
  "locked",
  withSharedMark(lockShackle + R(3.75, 10.5, 16.5, 10.5, 0.6), lockKeyhole),
  withSharedMark(
    lockShackle + F(box(3.75, 10.5, 16.5, 10.5, 0.6)),
    lockKeyhole,
    true,
  ),
);
const spark = (x, y, r = 2.25) =>
  F(
    `M${x} ${y - r}L${x + r * 0.28} ${y - r * 0.28}L${x + r} ${y}L${x + r * 0.28} ${y + r * 0.28}L${x} ${y + r}L${x - r * 0.28} ${y + r * 0.28}L${x - r} ${y}L${x - r * 0.28} ${y - r * 0.28}Z`,
  );
add(
  "magic-wand",
  S("M3.75 18L14.25 7.5L16.5 9.75L6 20.25Z M12 9.75L14.25 12") +
    spark(6, 6, 2.25) +
    spark(18, 4.5, 2.25) +
    spark(19.5, 16.5, 1.75),
);
const wrench =
  "M8.1 2.8A5.75 5.75 0 0 1 12.75 10.65L20.5 18.4Q21.55 19.45 20.5 20.5Q19.45 21.55 18.4 20.5L10.65 12.75A5.75 5.75 0 0 1 2.8 8.1L6.75 10.5L10.5 6.75Z";
add("maintenance", S(wrench), F(wrench));
const manHead = (x) => circ(x, 4.5, 2.25);
const manBody = (x) =>
  `M${x - 3.75} 9.75H${x + 3.75}V15.75H${x + 3}V21.75H${x - 3}V15.75H${x - 3.75}Z`;
const manLines = (x) => S(`M${x} 15.75V21.75`);
const womanBody = "M16 9.75H19L21.5 17.25H20.5V21.75H14.5V17.25H13.5Z";
add(
  "man-woman",
  S(manHead(6.5)) +
    S(manBody(6.5)) +
    manLines(6.5) +
    S(manHead(17.5)) +
    S(womanBody) +
    S("M17.5 17.25V21.75"),
  F(
    manHead(6.5) +
      manBody(6.5) +
      box(5.75, 15.75, 1.5, 6) +
      manHead(17.5) +
      womanBody +
      box(16.75, 17.25, 1.5, 4.5),
  ),
);
add(
  "man",
  S(manHead(12)) + S(manBody(12)) + manLines(12),
  F(manHead(12) + manBody(12) + box(11.25, 15.75, 1.5, 6)),
);
const map = "M3 5.25L9 2.75L15 5.25L21 2.75V18.75L15 21.25L9 18.75L3 21.25Z";
add(
  "map",
  S(map) + S("M9 2.75V18.75M15 5.25V21.25"),
  S(map) +
    S("M9 2.75V18.75M15 5.25V21.25") +
    F("M9 2.75L15 5.25V21.25L9 18.75Z"),
);
const sign = "M5.25 5.25H16.5L20.25 9L16.5 12.75H5.25Z";
add(
  "marker",
  S(sign) + S("M9.75 2.25V5.25M9.75 12.75V21.75"),
  F(sign) + S(sign) + S("M9.75 2.25V5.25M9.75 12.75V21.75"),
);
add(
  "maximize",
  R(3.75, 3.75, 16.5, 16.5) + S("M3.75 8.25H20.25"),
  R(3.75, 3.75, 16.5, 16.5) +
    S("M3.75 8.25H20.25") +
    F(box(3.75, 8.25, 16.5, 12)),
);
const kit = box(2.75, 4.5, 18.5, 15);
// Fill to the outline's painted edge so the straps retain their fitted anchors.
const kitEdge = (0.75 * 18.5) / 14;
const kitSurface = box(
  2.75 - kitEdge,
  4.5 - kitEdge,
  18.5 + 2 * kitEdge,
  15 + 2 * kitEdge,
);
// Keep the straps secondary to the medical cross at small sizes.
const kitBands = S("M5.75 4.5V19.5M18.25 4.5V19.5", 1.05);
add(
  "medical-kit",
  withSharedMark(S(kit) + kitBands, medicalCross),
  // Enclosed strap counters preserve the same continuous case as the outline.
  withSharedMark(
    F(kitSurface + box(5.15, 6, 1.2, 12) + box(17.65, 6, 1.2, 12)),
    medicalCross,
    true,
  ),
);
add("menu", S("M3 5.25H21M3 12H21M3 18.75H21"));

export default icons;
