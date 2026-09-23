import { softenedStroke as S, softenedFill as F } from "./contour-profiles.mjs";
import { softenedRect as R, softenedFrame as SF } from "./contour-profiles.mjs";
import { weldedPlusContour } from "./additions-marks.mjs";
import {
  compactSunRays,
  concaveMark,
  insideBoxCorners,
  historyArrowRoots,
} from "./b-junctions.mjs";
import { arrowRoot } from "./internal-arrow-junctions.mjs";
import { figma, github, linkedin, linkedinSolid } from "./brands.mjs";
import { weldedCross } from "./cross-marks.mjs";
import { circularCrossJunction } from "./junctions.mjs";
import {
  enclosedError,
  enclosedInfo,
  enclosedQuestion,
} from "./enclosed-marks.mjs";
import { lockKeyhole } from "./lock-marks.mjs";
import { withSharedMark } from "./mark-composition.mjs";
import { numberedTimer } from "./numbered-timer.mjs";
import { box, C, circ, dot, group } from "./primitives.mjs";
import { angledJunction } from "./structural-junctions.mjs";

// Newly drawn pictograms. The master grid is 24 units; the publishing step
// converts it to Salt's 16-unit grid. All counters are transparent geometry.
const icons = {};
const add = (name, outline, solid) => {
  icons[name] = [outline, solid];
};
const turn = (body, angle) => group(body, `rotate(${angle} 12 12)`);
const direction = (degrees) => [
  Math.cos((degrees * Math.PI) / 180),
  Math.sin((degrees * Math.PI) / 180),
];
// Match the single chevrons' broad arms; stacked strokes keep clear separation
// at 12px without changing their primary weight.
const chevrons =
  S("M2.625 2.625L12 12L21.375 2.625M2.625 11.25L12 20.625L21.375 11.25") +
  angledJunction(12, 12, [-1, -1], [1, -1], 1.8) +
  angledJunction(12, 20.625, [-1, -1], [1, -1], 1.8);
for (const [direction, angle] of [
  ["down", 0],
  ["left", 90],
  ["right", -90],
  ["up", 180],
])
  add(`double-chevron-${direction}`, turn(chevrons, angle));

add(
  "download",
  S("M12 2.25V17.25M6 11.25L12 17.25L18 11.25") + SF("M3.75 18.75v3h16.5v-3") +
    arrowRoot(12, 17.25, [0, -1]),
);
add("drag-row", S("M6 4.5H18M6 9.5H18M6 14.5H18M6 19.5H18"));
const pencil = "M4.5 15.75L16.5 3.75L20.25 7.5L8.25 19.5L3.75 20.25Z";
// Both variants retain the complete rim, cap and pointed nib. Filling only
// the barrel keeps the identifying openings, anchors and welds identical.
const pencilStructure = SF(pencil + "M14.25 6L18 9.75M4.5 15.75L8.25 19.5");
add(
  "edit",
  pencilStructure,
  F("M4.5 15.75L14.25 6L18 9.75L8.25 19.5Z") + pencilStructure,
);
add("equal", S("M2.25 8.25H21.75M2.25 15.75H21.75"));
const octagon =
  "M8.25 2.75H15.75L21.25 8.25V15.75L15.75 21.25H8.25L2.75 15.75V8.25Z";
add(
  "error",
  withSharedMark(S(octagon), enclosedError),
  withSharedMark(F(octagon), enclosedError, true),
);
add(
  "expand-all-horizontal",
  S("M9 6L3 12L9 18M15 6L21 12L15 18") +
    angledJunction(3, 12, [1, -1], [1, 1], 1.8) +
    angledJunction(21, 12, [-1, -1], [-1, 1], 1.8),
);
add(
  "expand-all",
  S("M6 9L12 3L18 9M6 15L12 21L18 15") +
    angledJunction(12, 3, [-1, 1], [1, 1], 1.8) +
    angledJunction(12, 21, [-1, -1], [1, -1], 1.8),
);
add(
  "expand",
  S(
    "M3.75 9V3.75H9M3.75 3.75L9.75 9.75M15 3.75H20.25V9M20.25 3.75L14.25 9.75M20.25 15V20.25H15M20.25 20.25L14.25 14.25M9 20.25H3.75V15M3.75 20.25L9.75 14.25",
  ) +
    arrowRoot(3.75, 3.75, [1, 1]) +
    arrowRoot(20.25, 3.75, [-1, 1]) +
    arrowRoot(20.25, 20.25, [-1, -1]) +
    arrowRoot(3.75, 20.25, [1, -1]),
);
add("exponentiation", S("M6.75 11.25L12 3.75L17.25 11.25"));
const exportShaft = "M7.5 12H21.75";
const exportHead = "M16.5 6.75L21.75 12L16.5 17.25";
const exportArrow = S(exportShaft + exportHead) + arrowRoot(21.75, 12, [-1, 0]);
const exportBracket = SF("M9 3.75H3.75V20.25H9");
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
// Keep the bottom edge and speech tail in one continuous contour. Separate
// butt-capped subpaths leave a wedge at their diagonal junction. The two open
// ends retain clearance measured to the actual curved foreground person,
// including each rear cap corner, at the W=7/6 theme midpoint.
// Ease the tail shoulder as in the speech family; its point, continuous left
// edge and both foreground-clearance endpoints stay unchanged.
const feedbackPanel = "M8.938451 15.75H7.5Q6.75 15.75 6.164349 16.218521L3 18.75V3H21.75V15.253408";
const feedbackText = S("M6 6.75H12M6 9.75H9.75M6 12.75H8.25");
const feedbackUser =
  "M10.5 21V19.25C10.5 17.65 12.5 16.75 15.75 16.75S21 17.65 21 19.25V21Z";
add(
  "feedback",
  SF(feedbackPanel) + feedbackText + C(15.75, 11.25, 2.4) + S(feedbackUser),
  SF(feedbackPanel) +
    feedbackText +
    F(circ(15.75, 11.25, 2.4) + feedbackUser) +
    C(15.75, 11.25, 2.4) +
    S(feedbackUser),
);
add("figma", figma);
// Reserve the modifier space in every state so the base funnel stays fixed.
const funnel = "M2.25 4.5H18.75L12.75 11.25V18.75L8.25 21V11.25Z";
add("filter", S(funnel), F(funnel) + S(funnel));
// Keep the full funnel recognizable, with a separate clear mark beside its stem.
const clearFunnel = funnel;
const filterClearMark = weldedCross(19.5, 17.25, 3, 3, 1.8);
add(
  "filter-clear",
  S(clearFunnel) + filterClearMark,
  F(clearFunnel) + S(clearFunnel) + filterClearMark,
);
add(
  "first",
  S("M4.5 4.5V19.5M16.5 4.5L9 12L16.5 19.5") +
    angledJunction(9, 12, [1, -1], [1, 1], 2),
);
const flag =
  "M5.25 4.5H11.25L14.25 7.5H20.25L17.25 12L20.25 16.5H12.75L9.75 13.5H5.25Z";
const flagRoots = [4.5, 13.5]
  .map((y) =>
    circularCrossJunction(5.25, y, 1.5, undefined, [
      [1, -1],
      [1, 1],
    ]),
  )
  .join("");
add(
  "flag",
  S(flag) + S("M5.25 2.25V21.75") + flagRoots,
  F(flag) + S(flag) + S("M5.25 2.25V21.75") + flagRoots,
);
const folder = "M3.75 20.25V4.5H9.75L12.75 7.5H20.25V20.25Z";
add(
  "folder-closed",
  SF(folder) +
    S("M3.75 10.5H20.25") +
    circularCrossJunction(3.75, 10.5, 1.45, undefined, [
      [1, -1],
      [1, 1],
    ]) +
    circularCrossJunction(20.25, 10.5, 1.45, undefined, [
      [-1, -1],
      [-1, 1],
    ]),
  F(folder + box(6, 9.75, 12, 1.5)),
);
const openFolder = "M3.75 20.25H18.75L21 10.5H6Z";
add(
  "folder-open",
  SF("M3.75 20.25V4.5H9.75L12.75 7.5H18.75V10.5") + SF(openFolder, { turns: "all" }),
  SF("M3.75 20.25V4.5H9.75L12.75 7.5H18.75V10.5") +
    F(openFolder) +
    SF(openFolder, { turns: "all" }),
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
  tiles
    .map(([x, y]) => R(x, y, 6, 6))
    .join(""),
  F(tiles.map(([x, y]) => box(x - 0.75, y - 0.75, 7.5, 7.5)).join("")),
);
const groupFrame = R(2.75, 2.75, 18.5, 18.5);
// Stop the rear lines around the foreground painted sides, retaining a
// useful gap at the heaviest width rather than fusing the selected objects.
const groupRear = S("M12.75 8.5V6.75H6.75V12.75H8.5");
const groupFront = box(10.5, 10.5, 6.75, 6.75);
const groupInnerCorners =
  insideBoxCorners(10.5, 10.5, 6.75, 6.75, 1.5) +
  circularCrossJunction(6.75, 6.75, 1.5, undefined, [[1, 1]]) +
  circularCrossJunction(12.75, 6.75, 1.5, undefined, [[-1, 1]]) +
  circularCrossJunction(6.75, 12.75, 1.5, undefined, [[1, -1]]);
// Keep the rear contour and the foreground square's landmarks in both styles.
add(
  "group",
  groupFrame + groupRear + S(groupFront) + groupInnerCorners,
  groupFrame + groupRear + F(groupFront) + S(groupFront) + groupInnerCorners,
);
add(
  "growth",
  S("M3 18.75L9 12.75L12.75 16.5L21 6.75M14.25 6.75H21V13.5") +
    angledJunction(21, 6.75, [-8.25, 9.75], [-1, 0], 1.6) +
    angledJunction(21, 6.75, [-8.25, 9.75], [0, 1], 1.6),
);
const bookClosed = "M6.75 3.75H20.25V20.25H6.75Z";
const bindingRoots = [7.5, 12, 16.5]
  .map((y) =>
    circularCrossJunction(6.75, y, 1.65, undefined, [
      [-1, -1],
      [-1, 1],
    ]),
  )
  .join("");
const spineRoots =
  circularCrossJunction(9.75, 3.75, 1.5, undefined, [
    [-1, 1],
    [1, 1],
  ]) +
  circularCrossJunction(9.75, 20.25, 1.5, undefined, [
    [-1, -1],
    [1, -1],
  ]);
add(
  "guide-closed",
  bindingRoots +
    spineRoots +
    SF(bookClosed) +
    S(
      "M9.75 3.75V20.25M3.75 7.5H6.75M3.75 12H6.75M3.75 16.5H6.75M12.75 8.25H17.25M12.75 12.75H17.25",
    ),
  F(
    bookClosed +
      box(9, 5.25, 1.5, 13.5) +
      box(12.75, 7.5, 4.5, 1.5) +
      box(12.75, 12, 4.5, 1.5),
  ) +
    SF(bookClosed) +
    S("M3.75 7.5H6.75M3.75 12H6.75M3.75 16.5H6.75") +
    bindingRoots,
);
// Keep the complete outer rim when filling pages so text centers and spine
// retain their original fitted frame; inverse text apertures remain wider.
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
  ) + S(bookOpen),
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
const cups = box(3.75, 12.75, 4.5, 7.5) + box(15.75, 12.75, 4.5, 7.5);
// Retain the cup perimeter when filling it: the headband and cup then share
// one outer edge at every configured width instead of stepping inward where
// the headband ends halfway down the cup.
const cupRoots =
  circularCrossJunction(3.75, 12.75, 1.6, undefined, [[1, -1]]) +
  circularCrossJunction(20.25, 12.75, 1.6, undefined, [[-1, -1]]);
add(
  "headphones",
  S(headband) + SF(cups) + cupRoots,
  S(headband) + SF(cups) + F(cups) + cupRoots,
);
// Calibrate complete cut caps at W=7/6 in the fitted frame, balancing both
// theme defaults. The right band ends inside both cup surfaces.
const disabledHeadband = S(
  "M3.75 15.75V10.5A8.25 8.25 0 0 1 4.052956 8.284825M7.505351 3.581862A8.25 8.25 0 0 1 20.25 10.5V15.464882",
);
const disabledCups =
  "M3.75 12.75H8.25V20.25H3.75ZM17.216588 12.75H20.25V13.35V15.783412";
const disabledCupFace =
  "M3.75 12.75H8.25V20.25H3.75ZM17.535118 12.75H20.25V13.35V15.464882Z";
add(
  "headphones-disabled",
  disabledHeadband + SF(disabledCups) + cupRoots + S("M3 3L21 21"),
  disabledHeadband +
    SF(disabledCupFace) +
    F(disabledCupFace) +
    cupRoots +
    S("M3 3L21 21"),
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
    // Union the complete lens with its W=1.5 rim in the retained frame, then
    // subtract the original slash corridor and pupil clearance together.
    // A single boundary at each opening prevents overlaid stroke-cap steps.
    "M20.118565 16.110636Q19.846886 16.439787 19.574636 16.746206L16.654585 13.826155Q17 12.945745 17 12Q17 11.877256 16.993977 11.754661Q16.987955 11.632067 16.975925 11.509914Q16.963894 11.387762 16.945885 11.266348Q16.927874 11.144932 16.903927 11.024548Q16.879982 10.904163 16.850157 10.785099Q16.820332 10.666035 16.784702 10.548577Q16.749071 10.431119 16.70772 10.315551Q16.666368 10.199982 16.619396 10.086582Q16.572426 9.9731817 16.519945 9.8622236Q16.467466 9.7512655 16.409607 9.6430168Q16.351746 9.5347662 16.288643 9.4294853Q16.22554 9.3242054 16.157349 9.2221479Q16.089157 9.1200905 16.016037 9.0215025Q15.942921 8.9229145 15.865053 8.8280334Q15.787186 8.7331505 15.704756 8.6422043Q15.622327 8.5512581 15.535534 8.4644661Q15.448742 8.3776741 15.357795 8.2952442Q15.266849 8.2128153 15.171968 8.1349478Q15.077085 8.0570803 14.978497 7.9839621Q14.879909 7.9108438 14.777851 7.8426514Q14.675794 7.7744589 14.570514 7.7113562Q14.465233 7.6482539 14.356983 7.5903935Q14.248734 7.5325327 14.137774 7.4800534Q14.026815 7.4275737 13.913416 7.3806019Q13.800016 7.3336306 13.684449 7.2922797Q13.568881 7.2509289 13.451424 7.2152987Q13.333965 7.1796684 13.214901 7.1498442Q13.095837 7.1200199 12.975451 7.0960736Q12.855066 7.0721273 12.733652 7.0541172Q12.612238 7.0361071 12.490086 7.0240765Q12.367933 7.0120454 12.245338 7.0060225Q12.122743 7 12 7Q11.054255 7 10.173844 7.3454156L7.4136209 4.5851932Q7.6076903 4.456315 7.8022232 4.3384728Q8.4836416 3.9256902 9.1711197 3.6480551Q9.8701878 3.3657391 10.57438 3.2235465Q11.286157 3.0798223 12 3.0798223Q12.713843 3.0798223 13.42562 3.2235465Q14.129812 3.3657391 14.82888 3.6480551Q15.516358 3.9256902 16.197777 4.3384728Q16.867474 4.7441549 17.531723 5.2806635Q18.186184 5.8092666 18.83633 6.4656644Q19.479034 7.1145477 20.118565 7.8893638Q20.752674 8.6576128 21.384483 9.5506496Q22.012394 10.438176 22.638678 11.449866L22.979237 12L22.638678 12.550134Q22.012394 13.561824 21.384483 14.44935Q20.752678 15.342382 20.118565 16.110636ZM7.3454156 10.173844L4.4253645 7.2537923Q4.1531138 7.560214 3.8814349 7.8893638Q3.2473326 8.6576033 2.6155174 9.5506496Q1.9875975 10.43819 1.3613218 11.449866L1.3613218 12.550134Q1.9875965 13.561809 2.6155174 14.44935Q3.2473297 15.342393 3.8814349 16.110636Q4.5209651 16.885452 5.1636701 17.534336Q5.8138242 18.190742 6.468276 18.719337Q7.1325188 19.255842 7.8022232 19.661528Q8.4836445 20.074312 9.1711197 20.351946Q9.8701801 20.634258 10.57438 20.776453Q11.286158 20.920177 12 20.920177Q12.713842 20.920177 13.42562 20.776453Q14.12982 20.634258 14.82888 20.351946Q15.516356 20.074312 16.197777 19.661528Q16.392309 19.543686 16.586378 19.414808L13.826155 16.654585Q12.945745 17 12 17Q11.877256 17 11.754661 16.993977Q11.632067 16.987955 11.509914 16.975925Q11.387762 16.963894 11.266348 16.945885Q11.144932 16.927874 11.024548 16.903927Q10.904163 16.879982 10.785099 16.850157Q10.666035 16.820332 10.548577 16.784702Q10.431119 16.749071 10.315551 16.70772Q10.199982 16.666368 10.086582 16.619396Q9.9731817 16.572426 9.8622236 16.519945Q9.7512655 16.467466 9.6430168 16.409607Q9.5347662 16.351746 9.4294853 16.288643Q9.3242054 16.22554 9.2221479 16.157349Q9.1200905 16.089157 9.0215025 16.016037Q8.9229145 15.942921 8.8280334 15.865053Q8.7331505 15.787186 8.6422043 15.704756Q8.5512581 15.622327 8.4644661 15.535534Q8.3776731 15.448742 8.2952442 15.357795Q8.2128143 15.266849 8.1349478 15.171968Q8.0570793 15.077085 7.9839621 14.978497Q7.9108438 14.879909 7.8426514 14.777851Q7.7744589 14.675794 7.7113562 14.570514Q7.6482534 14.465233 7.5903931 14.356983Q7.5325322 14.248734 7.4800529 14.137774Q7.4275732 14.026815 7.3806019 13.913416Q7.3336301 13.800016 7.2922792 13.684449Q7.2509284 13.568881 7.2152982 13.451424Q7.1796675 13.333965 7.1498432 13.214901Q7.120019 13.095837 7.0960732 12.975451Q7.0721273 12.855066 7.0541172 12.733652Q7.0361071 12.612238 7.0240765 12.490086Q7.0120454 12.367933 7.0060225 12.245338Q7 12.122743 7 12Q7 11.054255 7.3454156 10.173844Z",
  ) +
    hiddenPupil +
    S("M3 3L21 21"),
);
const childNodes = box(12.75, 9.75, 8.25, 4.5) + box(12.75, 17.25, 8.25, 4.5);
const hierarchyLinks =
  S("M6 9V19.5H12.75M6 12H12.75") +
  circularCrossJunction(6, 9, 1.45, undefined, [
    [-1, 1],
    [1, 1],
  ]) +
  circularCrossJunction(6, 12, 1.65, undefined, [
    [1, -1],
    [1, 1],
  ]) +
  circularCrossJunction(6, 19.5, 1.65, undefined, [[1, -1]]) +
  [12, 19.5]
    .map((y) =>
      circularCrossJunction(12.75, y, 1.65, undefined, [
        [-1, -1],
        [-1, 1],
      ]),
    )
    .join("");
add(
  "hierarchy",
  R(3, 3, 6, 6) + SF(childNodes) + hierarchyLinks,
  // Fill the nodes within their retained borders so the connectors do not move.
  F(box(3, 3, 6, 6) + childNodes) +
    R(3, 3, 6, 6) +
    SF(childNodes) +
    hierarchyLinks,
);
add(
  "history",
  S("M3.75 8.25A9 9 0 1 1 12 21M3.75 2.75V8.25H9.25M12 6V12L16 14.66667") +
    historyArrowRoots(),
);
const umbrella = "M10 11.25Q13.5 5.75 18 8.75Q21.75 11 21 14.25Z";
// Light's tangent roots adapted to the short rays of this compact sun.
// The sun remains a separate object from the umbrella.
// The smaller disc leaves more than one local band of straight ray at the
// high-density weight, avoiding short cog-like teeth in this tiny sun.
const sunshine = compactSunRays(6, 6, 1.65, 4, 1, 1.05);
const umbrellaPole = S("M15.732692 12.813462L13.5 21M2.25 21H21.75");
const canopyAngle = (Math.atan2(3, 11) * 180) / Math.PI;
const poleAngle = canopyAngle + 90;
const umbrellaRoots =
  angledJunction(
    15.732692,
    12.813462,
    direction(canopyAngle),
    direction(poleAngle),
    1.6,
  ) +
  angledJunction(
    15.732692,
    12.813462,
    direction(canopyAngle + 180),
    direction(poleAngle),
    1.6,
  ) +
  angledJunction(13.5, 21, direction(poleAngle + 180), direction(0), 1.6) +
  angledJunction(13.5, 21, direction(poleAngle + 180), direction(180), 1.6);
const holidayOutline =
  S(circ(6, 6, 1.65), 1.05) +
  sunshine +
  S(umbrella) +
  umbrellaPole +
  umbrellaRoots;
add("holiday", holidayOutline, dot(6, 6, 1.65) + F(umbrella) + holidayOutline);
const house = "M5.25 9.0203V20.25H9.75V13.5H14.25V20.25H18.75V9.0203";
const roofAngle = (Math.atan2(8.25, 9.25) * 180) / Math.PI;
const houseRoots =
  angledJunction(5.25, 9.02027, direction(-roofAngle), direction(90), 1.7) +
  angledJunction(
    5.25,
    9.02027,
    direction(180 - roofAngle),
    direction(90),
    1.1,
  ) +
  angledJunction(
    18.75,
    9.02027,
    direction(180 + roofAngle),
    direction(90),
    1.7,
  ) +
  angledJunction(18.75, 9.02027, direction(roofAngle), direction(90), 1.1);
const homeOutline = S("M2.75 11.25L12 3L21.25 11.25") + SF(house) + houseRoots;
// The doorway opens through the silhouette as one notch. A separate counter
// ending exactly on the house's bottom edge can leave an antialiased seam.
// Fill within the same roof and wall rim so both variants retain their eaves,
// welded roots, doorway and framing at every configurable stroke width.
const homeSurface =
  "M5.25 9.0203L12 3L18.75 9.0203V20.25H14.25V13.5H9.75V20.25H5.25Z";
add("home", homeOutline, F(homeSurface) + homeOutline);
// Health crosses retain a stronger, compact medical gesture. Their shorter
// arms use shallower fillets than an addition modifier; both polarities share
// exactly the same positive/inverse contour and the same building rim.
const hospitalFrame = R(6.75, 2.75, 10.5, 18.5);
const hospitalGround =
  S("M3 21.25H21") +
  [6.75, 17.25]
    .map((x) =>
      circularCrossJunction(x, 21.25, 1.7, undefined, [
        [-1, -1],
        [1, -1],
      ]),
    )
    .join("");
const hospitalCross = weldedPlusContour(8, 5.17, 2.264, 1.6, 0.4);
add(
  "hospital",
  withSharedMark(
    hospitalFrame +
      hospitalGround +
      S("M9 14.25H10.5M13.5 14.25H15M10.5 21.25V18H13.5V21.25") +
      circularCrossJunction(10.5, 21.25, 1.4, undefined, [[-1, -1]]) +
      circularCrossJunction(13.5, 21.25, 1.4, undefined, [[1, -1]]),
    hospitalCross,
  ),
  withSharedMark(
    F(
      box(6.75, 2.75, 10.5, 18.5) +
        box(9, 13.5, 1.5, 1.5) +
        box(13.5, 13.5, 1.5, 1.5) +
        box(10.5, 18, 3, 3.25),
    ) +
      hospitalFrame +
      hospitalGround,
    hospitalCross,
    true,
  ),
);
const imagePage = "M3.75 2.25H15.75L20.25 6.75V21.75H3.75Z";
const imageFold = "M15.75 2.25V6.75H20.25";
const imageFoldCounter = "M15.75 3.75V6Q15.75 6.75 16.5 6.75H18.75Z";
const imageMarks =
  circ(8.25, 11.25, 1.5) +
  "M6.75 18.75L10.125 15L12.75 17.25L15.75 13.5L18 16.125V18.75Z";
add(
  "image",
  SF(imagePage + imageFold) + F(imageMarks),
  F(imagePage + imageFoldCounter + imageMarks),
);
const importShaft = "M3 12H15";
const importHead = "M10.5 7.5L15 12L10.5 16.5";
const importArrow = S(importShaft + importHead) + arrowRoot(15, 12, [-1, 0]);
const importBracket = SF("M9.75 3.75H20.25V20.25H9.75");
add(
  "import",
  importBracket + importArrow,
  // The legacy Solid export retains this open-line drawing.
  importBracket + importArrow,
);
const inbox = "M3.75 9.75V20.25H20.25V9.75";
const inboxNotch = "M3.75 13.5H8.25L9.75 16.5H14.25L15.75 13.5H20.25";
const inboxArrow =
  S("M12 2.25V12.75M7.5 8.25L12 12.75L16.5 8.25") +
  arrowRoot(12, 12.75, [0, -1]);
const inboxTray =
  SF(inbox + inboxNotch) +
  circularCrossJunction(3.75, 13.5, 1.6, undefined, [
    [1, -1],
    [1, 1],
  ]) +
  circularCrossJunction(20.25, 13.5, 1.6, undefined, [
    [-1, -1],
    [-1, 1],
  ]);
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
  ) + angledJunction(7.5, 12, [-1, -1], [-1, 1], 2),
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
add("jigsaw", SF(puzzle), F(puzzle));
add(
  "key-backspace",
  SF("M9 5.25H21V18.75H9L2.25 12Z") + weldedCross(15, 12, 3, 3, 1.7),
);
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
add(
  "key-enter",
  S("M20.25 5.25V14.25H3.75M9 9L3.75 14.25L9 19.5") +
    arrowRoot(3.75, 14.25, [1, 0]),
);
add("key-option", S("M3 6.75H8.25L15.75 18.75H21M14.25 6.75H21"));
add("key-shift", S("M3.75 11.25L12 3.75L20.25 11.25H15.75V20.25H8.25V11.25Z"));
add(
  "key-tab",
  S("M3 12H17.25M11.25 6L17.25 12L11.25 18M21 4.5V19.5") +
    arrowRoot(17.25, 12, [-1, 0]),
);
const key = "M10.4 13.6A5.25 5.25 0 1 1 13.6 10.4L21 17.8V21H17.8V18H14.8V15Z";
// The bow's arc center is approximately (8.65,8.65). A simple dot/hole
// uses that same center and avoids a second, microscopic stroked counter.
add(
  "key",
  S(key) + F(circ(8.65, 8.65, 1.5)),
  F(key + circ(8.65, 8.65, 1.5)) + S(key),
);
add(
  "last",
  S("M19.5 4.5V19.5M7.5 4.5L15 12L7.5 19.5") +
    angledJunction(15, 12, [-1, -1], [-1, 1], 2),
);
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
// One fixed Y contour preserves the branch gesture in positive and inverse
// form. The three concave corners are eased while branch tips remain flat.
const filamentHalf = 0.95;
const filamentOffset = filamentHalf / Math.SQRT2;
const filamentBranchY = 10.5 + filamentHalf * (Math.SQRT2 - 1);
const filament = concaveMark(
  [
    [9.75 - filamentOffset, 8.25 + filamentOffset],
    [12 - filamentHalf, filamentBranchY],
    [12 - filamentHalf, 16.5],
    [12 + filamentHalf, 16.5],
    [12 + filamentHalf, filamentBranchY],
    [14.25 + filamentOffset, 8.25 + filamentOffset],
    [14.25 - filamentOffset, 8.25 - filamentOffset],
    [12, 10.5 - filamentHalf * Math.SQRT2],
    [9.75 + filamentOffset, 8.25 - filamentOffset],
  ],
  { 1: 0.78, 4: 0.78, 7: 0.78 },
);
const bulbBars = S("M8.25 19.5H15.75M10.5 22.625H13.5");
const bulbOpen = bulb.slice(0, -1);
const filamentFoot = circularCrossJunction(12, 16.5, 1.6, undefined, [
  [-1, -1],
  [1, -1],
]);
add(
  "lightbulb",
  S(bulb) + bulbBars + F(filament) + filamentFoot,
  // Retain the shared bulb rim, opening only its base for the inverse stem.
  F(bulb + filament) +
    S(bulbOpen) +
    S(`M8.25 16.5H${12 - filamentHalf}M${12 + filamentHalf} 16.5H15.75`) +
    bulbBars,
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
const lockShackle =
  S("M6.75 10.5V7.5A5.25 5.25 0 0 1 17.25 7.5V10.5") +
  [6.75, 17.25]
    .map((x) =>
      circularCrossJunction(x, 10.5, 1.65, undefined, [
        [-1, -1],
        [1, -1],
      ]),
    )
    .join("");
const lockBody = box(3.75, 10.5, 16.5, 10.5);
add(
  "locked",
  withSharedMark(lockShackle + SF(lockBody), lockKeyhole),
  withSharedMark(lockShackle + F(lockBody) + SF(lockBody), lockKeyhole, true),
);
const spark = (x, y, r = 2.25) =>
  F(
    `M${x} ${y - r}L${x + r * 0.28} ${y - r * 0.28}L${x + r} ${y}L${x + r * 0.28} ${y + r * 0.28}L${x} ${y + r}L${x - r * 0.28} ${y + r * 0.28}L${x - r} ${y}L${x - r * 0.28} ${y - r * 0.28}Z`,
  );
add(
  "magic-wand",
  S("M3.75 18L14.25 7.5L16.5 9.75L6 20.25Z M12 9.75L14.25 12") +
    angledJunction(12, 9.75, [1, -1], [1, 1], 1.5) +
    angledJunction(12, 9.75, [-1, 1], [1, 1], 1.5) +
    angledJunction(14.25, 12, [1, -1], [-1, -1], 1.5) +
    angledJunction(14.25, 12, [-1, 1], [-1, -1], 1.5) +
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
// Solid bodies include the complete outer rim at fit width W=1.5 in the
// unchanged outline frame. Each leg aperture is one exterior notch; separate
// touching even-odd rectangles left a phase-dependent line across the feet.
const manBodySolid = (x) =>
  `M${x - 4.7946429} 8.7053571H${x + 4.7946429}V16.7946429H${x + 4.0446429}V22.7946429H${x + 0.75}V15.75H${x - 0.75}V22.7946429H${x - 4.0446429}V16.7946429H${x - 4.7946429}Z`;
const womanBodySolid =
  "M15.247064 8.7053566L19.752935 8.7053566L22.949364 18.294643L21.544643 18.294643L21.544643 22.794643L18.25 22.794643L18.25 17.25L16.75 17.25L16.75 22.794643L13.455357 22.794643L13.455357 18.294643L12.050635 18.294643L15.247064 8.7053566Z";
add(
  "man-woman",
  S(manHead(6.5)) +
    SF(manBody(6.5)) +
    manLines(6.5) +
    S(manHead(17.5)) +
    S(womanBody) +
    S("M17.5 17.25V21.75"),
  F(manHead(6.5) + manBodySolid(6.5) + manHead(17.5) + womanBodySolid) +
    S(manHead(6.5)) +
    S(manHead(17.5)),
);
add(
  "man",
  S(manHead(12)) + SF(manBody(12)) + manLines(12),
  F(manHead(12) + manBodySolid(12)) + S(manHead(12)),
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
const markerPole =
  S("M9.75 2.25V5.25M9.75 12.75V21.75") +
  circularCrossJunction(9.75, 5.25, 1.65, undefined, [
    [-1, -1],
    [1, -1],
  ]) +
  circularCrossJunction(9.75, 12.75, 1.65, undefined, [
    [-1, 1],
    [1, 1],
  ]);
add("marker", S(sign) + markerPole, F(sign) + S(sign) + markerPole);
const maximizeDivider =
  S("M3.75 8.25H20.25") +
  circularCrossJunction(3.75, 8.25, 1.55, undefined, [
    [1, -1],
    [1, 1],
  ]) +
  circularCrossJunction(20.25, 8.25, 1.55, undefined, [
    [-1, -1],
    [-1, 1],
  ]);
add(
  "maximize",
  R(3.75, 3.75, 16.5, 16.5) + maximizeDivider,
  R(3.75, 3.75, 16.5, 16.5) + maximizeDivider + F(box(3.75, 8.25, 16.5, 12)),
);
// The handle and uninterrupted case replace decorative straps, making the
// object read as a first-aid kit rather than a framed health symbol at 12px.
const kit = box(2.75, 7.5, 18.5, 13.5);
const kitHandle =
  S("M8.25 7.5V3H15.75V7.5") +
  [8.25, 15.75]
    .map((x) =>
      circularCrossJunction(x, 7.5, 1.65, undefined, [
        [-1, -1],
        [1, -1],
      ]),
    )
    .join("");
const kitOutline = SF(kit) + kitHandle;
const kitCross = weldedPlusContour(8, 9.7, 3, 2.5, 0.6);
add(
  "medical-kit",
  withSharedMark(kitOutline, kitCross),
  withSharedMark(F(kit) + kitOutline, kitCross, true),
);
add("menu", S("M3 5.25H21M3 12H21M3 18.75H21"));

export default icons;
