import { F as retainedFill } from "./primitives.mjs";
import { softenedStroke as S, softenedFill as F } from "./contour-profiles.mjs";
import { softenedRect as R, softenedFrame as SF } from "./contour-profiles.mjs";
import { arrowRoot } from "./internal-arrow-junctions.mjs";
import { concavePolygon, innerRadialJoin, circularHeadJoins, cubicHeadJoins } from "./cd-junctions.mjs";
import { actionPerson } from "./user-actions.mjs";
import { notificationRead } from "./action-marks.mjs";
import { weldedCross, weldedXContour } from "./cross-marks.mjs";
import {
  angledJunction,
  radialCircleJunction,
} from "./structural-junctions.mjs";
import { enclosedDot, enclosedTick } from "./enclosed-marks.mjs";
import { faceMarks } from "./face-marks.mjs";
import { circularCrossJunction } from "./junctions.mjs";
import { standaloneMark, withSharedMark } from "./mark-composition.mjs";
import { numberedTimer } from "./numbered-timer.mjs";
import { box, C, circ, dot, group, L, opticalScale, textLabel } from "./primitives.mjs";

// Each drawing is composed on the shared 24-unit construction grid, then
// published at 16px. Filled versions retain real transparent counters.
const icons = {};
const put = (name, outline, solid) => {
  icons[name] = [outline, solid];
};
const cross = (x = 12, y = 12, r = 3) =>
  S(
    `M${x - r} ${y - r}l${2 * r} ${2 * r}M${x + r} ${y - r}l${-2 * r} ${2 * r}`,
  );
// Filled seams follow the outline centerlines, stopping short of the shell corners.
const envelope = "M3.75 5.25h16.5v13.5H3.75Z";
put(
  "message",
  SF(envelope) +
    S("M3.75 6.75L12 12.75l8.25-6M3.75 18.75l5.25-5.25m6 0 5.25 5.25"),
  F(
    `${envelope}M5.69113 7.23436 12 11.82263 18.30887 7.23436 19.19113 8.44746 12 13.67737 4.80887 8.44746ZM15.53033 12.96967 19.28033 16.71967 18.21967 17.78033 14.46967 14.03033ZM4.71967 16.71967 8.46967 12.96967 9.53033 14.03033 5.78033 17.78033Z`,
  ),
);
const messageAction = (kind) => {
  const reply = kind !== "forward";
  // Leave a clear horizontal shaft before the quarter-circle bend.
  // The former broad bend crowded Reply All's rear chevron at its tip.
  const arrow = reply
    ? "M20.25 20.25V12.75a4.5 4.5 0 0 0-4.5-4.5H5.25M9.75 3.75l-4.5 4.5 4.5 4.5"
    : "M3.75 20.25V12.75a4.5 4.5 0 0 1 4.5-4.5h10.5M14.25 3.75l4.5 4.5-4.5 4.5";
  return kind === "reply-all"
    ? S(
        "M20.25 20.25V12.75a4.5 4.5 0 0 0-4.5-4.5H11.25M15.75 3.75l-4.5 4.5 4.5 4.5M9.75 3.75l-4.5 4.5 4.5 4.5",
      )
    : S(arrow);
};
for (const k of ["forward", "reply", "reply-all"])
  put(`message-${k}`, messageAction(k));
// Menu ellipses share Chatting's final two-unit round dots. Wider spacing
// lets the standalone controls occupy the normal icon frame without scaling dots.
put(
  "micro-menu",
  standaloneMark([1.25, 8, 14.75].map((y) => enclosedDot(8, y)).join("")),
);
put(
  "overflow-menu",
  standaloneMark([1.25, 8, 14.75].map((x) => enclosedDot(x, 8)).join("")),
);

const mic = box(8.25, 2.25, 7.5, 13.5, 3.75);
const micSupportJoins =
  radialCircleJunction(12, 12, 6.75, 1.65, 90) +
  circularCrossJunction(12, 21.75, 1.7, undefined, [
    [-1, -1],
    [1, -1],
  ]);
const micBase =
  S("M5.25 10.5v1.5a6.75 6.75 0 0 0 13.5 0v-1.5M12 18.75v3M8.25 21.75h7.5") +
  micSupportJoins;
put("microphone", S(mic) + micBase, F(mic) + S(mic) + micBase);
// Both variants retain the same capsule, support and slash paint. The filled
// interior stops at the outline's 1.22-unit final clearance at W = 7/6;
// its cut edges have no stroke and do not grow into the slash corridor.
const micDisabledCapsule = S(
  "M12 2.25Q15.75 2.25 15.75 6V11.385298M11.255138 15.708808Q8.601835 15.398165 8.291192 12.744862M8.472431 4.39583Q9.163301 2.25 12 2.25",
);
const micDisabledSupport = S(
  "M5.25 10.5V12C5.25 15.72792 8.27208 18.75 12 18.75C12.810389 18.75 13.587424 18.607189 14.307309 18.345362M18.345362 14.307309C18.607189 13.587424 18.75 12.810389 18.75 12V10.5M12 18.75V21.75M8.25 21.75H15.75",
);
const micDisabledOutline =
  micDisabledCapsule + micDisabledSupport + micSupportJoins + S("M3 3L21 21");
put(
  "microphone-disabled",
  micDisabledOutline,
  F(
    "M12 2.25Q15.75 2.25 15.75 6V12Q15.75 12.098899 15.747392 12.19519L8.363049 4.810847Q8.901101 2.25 12 2.25ZM8.25 11.802202V12Q8.25 15.75 12 15.75Q12.098899 15.75 12.19519 15.747392Z",
  ) + micDisabledOutline,
);
put("minimize", S("M3.75 18.75h16.5"));
const mouse =
  "M12 2.25a6.75 6.75 0 0 1 6.75 6.75v6a6.75 6.75 0 0 1-13.5 0V9A6.75 6.75 0 0 1 12 2.25Z";
put(
  "mouse",
  S(mouse) +
    S("M5.25 12h13.5") +
    circularCrossJunction(5.25, 12, 2, undefined, [
      [1, -1],
      [1, 1],
    ]) +
    circularCrossJunction(18.75, 12, 2, undefined, [
      [-1, -1],
      [-1, 1],
    ]) +
    S(box(10.5, 5.5, 3, 3.5, 0.75), 1.125),
  // The slot is an isolated counter, not another T; keep its flat ends.
  // Retain the mouse perimeter so the wheel and divider do not shift.
  F(mouse + box(10.5, 5.5, 3, 3.5, 0.75) + box(6.75, 11.25, 10.5, 1.5)) +
    S(mouse),
);
const moveH = S(
  "M2.25 12h19.5M6.75 7.5L2.25 12l4.5 4.5M17.25 7.5l4.5 4.5-4.5 4.5",
);
put("move-horizontal", moveH);
put("move-vertical", group(moveH, "rotate(90 12 12)"));
put(
  "move-all",
  S(
    "M2.25 12h19.5M12 2.25v19.5M5.25 9l-3 3 3 3M18.75 9l3 3-3 3M9 5.25l3-3 3 3M9 18.75l3 3 3-3",
  ) + circularCrossJunction(12, 12, 2.1),
);
put(
  "multiply",
  cross(12, 12, 6.75) +
    group(circularCrossJunction(12, 12, 2.05), "rotate(45 12 12)"),
);

const musicStems = S("M9.75 16.5V5.25l10.5-3v12.75M9.75 9.75l10.5-3");
const musicNotes =
  "M9.75 16.5c0 1.65-1.7 3-3.75 3s-3-1.05-3-2.25 1.7-3 3.75-3 3 1.05 3 2.25ZM20.25 15c0 1.65-1.7 3-3.75 3s-3-1.05-3-2.25 1.7-3 3.75-3 3 1.05 3 2.25Z";
const musicOutline = musicStems + S(musicNotes);
// Keep the note perimeters when filling them so each stem enters the rounded
// shoulder cleanly instead of protruding past an unstroked note head.
const musicSolid =
  musicOutline + F(`M9.75 5.25L20.25 2.25V6.75L9.75 9.75Z${musicNotes}`);
put("music", musicOutline, musicSolid);
// Open beam/stem and note ends balance their complete painted cap corners
// at W=7/6. Filled surfaces retain their independently reviewed corridor.
const musicDisabledStems = S(
  "M9.75 16.5V15.751008M9.75 6.748992V5.25L20.25 2.25V15M11.878154 9.141956L20.25 6.75",
);
// Clip the same beam and note contours, retaining one complete stroked-and-
// filled perimeter. The diagonal centerline balances the existing visible
// clearance at W=7/6; it does not expand either note or freeze a W=1.5 beam.
// The isolated lower-left note has no residual stem fragment.
const musicDisabledSolidSurface =
  "M9.75 5.25L20.25 2.25V6.75L11.575736 9.228361L9.75 7.402625Z" +
  "M20.25 15C20.25 15.752323 19.896581 16.442277 19.31771 16.970335L15.524403 13.177028C16.04278 12.91443 16.630404 12.75 17.25 12.75C19.3 12.75 20.25 13.8 20.25 15Z" +
  "M9.75 16.5c0 1.65-1.7 3-3.75 3s-3-1.05-3-2.25 1.7-3 3.75-3 3 1.05 3 2.25Z";
put(
  "music-disabled",
  musicDisabledStems +
    S(
      "M9.75 16.5C9.75 18.15 8.05 19.5 6 19.5C3.95 19.5 3 18.45 3 17.25C3 16.05 4.7 14.25 6.75 14.25C8.8 14.25 9.75 15.3 9.75 16.5M20.25 15C20.25 15.777168 19.872853 16.48778 19.259627 17.022118M15.676531 13.103736C16.156606 12.884197 16.690256 12.75 17.25 12.75C19.3 12.75 20.25 13.8 20.25 15",
    ) +
    S("M2.25 3.75L21 22.5"),
  S(musicDisabledSolidSurface) +
    F(musicDisabledSolidSurface) +
    S("M20.25 6.75V15M2.25 3.75L21 22.5"),
);
put("not-allowed", C(12, 12, 9) +
  S(`M${12 - 9 / Math.SQRT2} ${12 - 9 / Math.SQRT2}L${12 + 9 / Math.SQRT2} ${12 + 9 / Math.SQRT2}`) +
  innerRadialJoin(12, 12, 9, 1.5, 45) + innerRadialJoin(12, 12, 9, 1.5, 225));
const note = "M3.75 3.75h16.5v10.5l-6 6H3.75Z";
put(
  "note",
  SF(note) + SF("M14.25 20.25v-6h6M6.75 8.25h10.5M6.75 11.25h6"),
  F(
    note +
      box(6, 7.5, 12, 1.5) +
      box(6, 10.5, 7.5, 1.5) +
      "M14.25 18.75l4.5-4.5h-4.5Z",
  ),
);
const bell = "M6.75 9a5.25 5.25 0 0 1 10.5 0v3.75l3 4.5H3.75l3-4.5Z";
// The finial has only 1.5 construction units of exposed length. A compact
// 1.3-radius join preserves a straight tip instead of swelling the crown.
const bellCrownJoin = radialCircleJunction(12, 9, 5.25, 1.3, -90);
const bellTip = S("M9.75 20.25h4.5M12 3.75v-1.5") + bellCrownJoin;
// Fill inside the retained bell perimeter so its crown and clapper stay fixed.
put("notification", S(bell) + bellTip, F(bell) + S(bell) + bellTip);
put(
  "notification-read",
  ...notificationRead.map((drawing) => drawing + bellCrownJoin),
);
put(
  "outdent",
  S(
    "M3 3.75H21M3 20.25H21M11.25 9.75H21M11.25 14.25H21M6.75 8.25L3 12l3.75 3.75",
  ),
);
const clipboard = "M7.5 3.75H3.75v18h16.5v-18h-3.75";
const clipboardFrame = SF(clipboard) + R(7.5, 2.25, 9, 4.5);
// Open the clip through the filled body as one notch, rather than a hole
// coincident with its top edge. Retain the body's rim and the exact clip.
const clipboardSurface = "M3.75 3.75H7.5V6.75H16.5V3.75H20.25V21.75H3.75Z";
put(
  "paste",
  clipboardFrame + S("M7.5 11.25h9M7.5 15.75h9"),
  F(clipboardSurface + box(6.75, 10.5, 10.5, 1.5) + box(6.75, 15, 10.5, 1.5)) +
    clipboardFrame,
);
put(
  "pause",
  R(5.25, 3.75, 4.5, 16.5) + R(14.25, 3.75, 4.5, 16.5),
  F(box(4.5, 3, 6, 18) + box(13.5, 3, 6, 18)),
);
put(
  "percentage",
  C(6.75, 6.75, 3) + C(17.25, 17.25, 3) + S("M5.25 20.25L18.75 3.75"),
);
put(
  "pi",
  S(
    "M3 5.25h18M8.25 5.25V16.5q0 3.75-3.75 3.75M15.75 5.25v12.75q0 2.25 2.25 2.25h3",
  ),
);
const picnicTree = "M17.25 3.75l4.5 10.5h-9Z";
const picnicBase =
  S(
    "M2.25 21.75h19.5M17.25 11.25v10.5M2.25 14.25h9M5.25 14.25v7.5M2.25 18.75h6",
  ) +
  circularCrossJunction(5.25, 14.25, 1.65, undefined, [
    [-1, 1],
    [1, 1],
  ]) +
  circularCrossJunction(5.25, 18.75, 1.65) +
  circularCrossJunction(5.25, 21.75, 1.5, undefined, [
    [-1, -1],
    [1, -1],
  ]) +
  circularCrossJunction(17.25, 14.25, 1.65) +
  circularCrossJunction(17.25, 21.75, 1.8, undefined, [
    [-1, -1],
    [1, -1],
  ]);
// Retain the tree perimeter in both styles so filling the canopy does not
// rescale or move the shared bench, trunk and ground after export fitting.
put(
  "picnic",
  S(picnicTree) + picnicBase,
  S(picnicTree) + F(picnicTree) + picnicBase,
);
// A flat head, straight neck and wider flange distinguish the tack from an
// hourglass. The diagonal presentation separates its head from the long needle.
// Treat all four neck attachments, not only the needle-to-flange root.
// The head has room for a 1.4-unit tangent run; an automatic .4 edge cap
// would hide the resulting curve beneath the heavy themed stroke.
const pin = concavePolygon(
  [[8.25, 3], [15.75, 3], [15.75, 6], [14.25, 6],
   [14.25, 12.75], [17.25, 15.75], [17.25, 17.25], [6.75, 17.25],
   [6.75, 15.75], [9.75, 12.75], [9.75, 6], [8.25, 6]],
  (index) => index === 3 || index === 10 ? 1.4 : 1.6,
  new Set([3, 4, 9, 10]),
  new Map([[3, .94], [10, .94], [4, 1], [9, 1]]),
);
const pinPoint = S("M12 17.25v5.25") +
  circularCrossJunction(12, 17.25, 1.6, undefined, [[-1, 1], [1, 1]]);
put(
  "pin",
  group(S(pin) + pinPoint, "rotate(45 12 12)"),
  group(F(pin) + S(pin) + pinPoint, "rotate(45 12 12)"),
);
// The same filled arrow contour supplies the positive and inverse mark.
// Concave head roots and its inner elbow are eased; outer tips stay exact.
const pivotMark = concavePolygon([
  [11.113604, 9.363604], [14.75, 5.727208], [18.386396, 9.363604],
  [17.113604, 10.636396], [15.65, 9.172792], [15.65, 16.15],
  [8.922792, 16.15], [10.386396, 17.613604], [9.113604, 18.886396],
  [5.477208, 15.25], [9.113604, 11.613604], [10.386396, 12.886396],
  [8.922792, 14.35], [13.85, 14.35], [13.85, 9.172792],
  [12.386396, 10.636396],
], .65);
put("pivot", R(2.25, 2.25, 19.5, 19.5) + F(pivotMark),
  F(box(2.25, 2.25, 19.5, 19.5) + pivotMark) + R(2.25, 2.25, 19.5, 19.5));
put("place-in", SF("M12 3.75H3.75v16.5h16.5V12") + S("M21 3L10.5 13.5m0-6v6h6"));
const play = "M6.75 3.75l13.5 8.25-13.5 8.25Z";
put("play", S(play), F(play));
put(
  "policy",
  SF("M11.25 21.75h-6V2.25H15l3.75 3.75") +
    SF("M15 2.25V6h3.75") +
    S("M8.25 8.25h3M8.25 12.75h3") +
    S("M15 17.25V21.75L18 20.85L21 21.75V17.25", 1.08) +
    C(18, 13.5, 4.5),
);
// The original open food bowl retains its contents and rising steam.
const pot =
  "M4.5 10.5H19.5V12.75C19.5 16.89 16.14 19.5 12 19.5S4.5 16.89 4.5 12.75Z";
const potFood = F("M6.75 10.5C7.5 8.25 11.25 8.25 12 10.5Z");
const potGripJoin =
  circularCrossJunction(4.5, 12, 1.5, undefined, [[-1, -1]]) +
  S("M3.031402 12A1.5 1.5 0 0 1 4.526051 13.373412") +
  `<path d="M3.031402 12A1.5 1.5 0 0 1 4.526051 13.373412C4.508799 13.169711 4.5 12.961859 4.5 12.75V12Z" fill="currentColor" stroke="none"/>`;
const potJoins =
  potGripJoin + group(potGripJoin, "translate(24 0) scale(-1 1)");
const potDetails =
  S(
    "M2.25 12H4.5M19.5 12H21.75M16.5 2.25C16.5 4.25 15 5.5 15 7.5M20.25 2.25C20.25 4.25 18.75 5.5 18.75 7.5",
  ) +
  F(box(8.25, 19.5, 7.5, 2.25)) +
  potJoins;
put(
  "pot-food",
  S(pot) + potFood + potDetails,
  F(pot) + S(pot) + potFood + potDetails,
);
// A presentation board stands on an easel, rather than a monitor pedestal.
const presentationLegs =
  S("M7.5 22L12 18L16.5 22") +
  angledJunction(12, 18, [-1, 0], [-4.5, 4], 1.5) +
  angledJunction(12, 18, [1, 0], [4.5, 4], 1.5) +
  angledJunction(12, 18, [-4.5, 4], [4.5, 4], 1.5);
const presentationHeaderJoins =
  circularCrossJunction(3, 7.5, 1.8, undefined, [
    [1, -1],
    [1, 1],
  ]) +
  circularCrossJunction(21, 7.5, 1.8, undefined, [
    [-1, -1],
    [-1, 1],
  ]);
const presentationBoard = box(3, 3.5, 18, 14.5);
put(
  "presentation",
  SF(presentationBoard) +
    S("M3 7.5H21M7 11H17M7 14.5H17") +
    presentationHeaderJoins +
    presentationLegs,
  F(
    presentationBoard +
      box(4.5, 6.75, 15, 1.5) +
      box(6.5, 10.25, 11, 1.5, 0.3) +
      box(6.5, 13.75, 11, 1.5, 0.3),
  ) +
    SF(presentationBoard) +
    presentationLegs,
);
put(
  "price-ladder",
  S(
    "M6.75 2.25v19.5M17.25 2.25v19.5M6.75 6.75h10.5M6.75 12h10.5M6.75 17.25h10.5",
  ) +
    [6.75, 12, 17.25]
      .map(
        (y) =>
          circularCrossJunction(6.75, y, 2, undefined, [
            [1, -1],
            [1, 1],
          ]) +
          circularCrossJunction(17.25, y, 2, undefined, [
            [-1, -1],
            [-1, 1],
          ]),
      )
      .join(""),
);
// Straight landmarks sit on the 12px primary-stroke grid after normalization.
// The optical profile preserves this authored frame instead of enlarging it.
const printTop = SF("M7 9V3H17V9");
const printOutput = R(7, 15, 10, 6);
const printHousing = SF("M7 17H3V9H21V17H17");
const printJoins = [7, 17].map((x) =>
  circularCrossJunction(x, 9, 1.6, undefined, [[-1, -1], [1, -1]]) +
  circularCrossJunction(x, 17, 1.6, undefined,
    x === 7 ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]),
).join("");
const printOutline = printHousing + printTop + printOutput + printJoins;
// The output sheet opens through the housing as one notch. A closed hole
// ending exactly on the housing's bottom edge can leave a raster seam across
// the paper. Retain the same housing rim and both paper contours in the pair.
const printSurface = "M3 9H21V17H17V15H7V17H3Z";
put("print", printOutline, F(printSurface) + printOutline);

const progressDisk = (holes) => F(circ(12, 12, 9.75) + holes);
// Peer status glyphs are optically balanced on the final canvas. Four-arm and
// closed-ring shapes need less thickness than the single minus or shared tick.
const progressMark = (mark) =>
  withSharedMark(F(circ(12, 12, 9.75)), mark, true);
const progressCross = weldedXContour(8, 8, 3 * Math.SQRT2 + 0.875, 1.75, 0.5);
put("progress-cancelled", progressMark(progressCross));
put(
  "progress-closed",
  progressMark(box(4.425, 4.425, 7.15, 7.15) + box(6.025, 6.025, 3.95, 3.95)),
);
put(
  "progress-complete",
  withSharedMark(F(circ(12, 12, 9)), enclosedTick, true),
);
put("progress-draft", C(12, 12, 9));
put("progress-inprogress", C(12, 12, 9) + F("M12 3a9 9 0 0 1 0 18Z"));
put(
  "progress-onhold",
  progressDisk(box(8.25, 7.5, 2.25, 9) + box(13.5, 7.5, 2.25, 9)),
);
put(
  "progress-pending",
  progressDisk(
    "M12.75 6.75V11.59861L15.91603 13.70929L15.08397 14.95737L11.25 12.40139V6.75Z",
  ),
);
put("progress-rejected", progressMark(box(3.825, 7, 8.35, 2)));
put(
  "progress-todo",
  [0, 45, 90, 135, 180, 225, 270, 315]
    .map((angle) =>
      group(S("M10.4372 3.1367a9 9 0 0 1 3.1256 0"), `rotate(${angle} 12 12)`),
    )
    .join(""),
);
// The protection pictogram keeps the original divided shield.
const shield =
  "M12 2.25C8.75 4.25 6.3 4.8 3.75 5.25C3.75 12.5 5.5 18.7 12 21.75C18.5 18.7 20.25 12.5 20.25 5.25C17.7 4.8 15.25 4.25 12 2.25Z";
const shieldHalf =
  "M12 2.25C15.25 4.25 17.7 4.8 20.25 5.25C20.25 12.5 18.5 18.7 12 21.75Z";
put("protection", S(shield) + S("M12 2.25V21.75"), S(shield) + F(shieldHalf));
const receipt =
  "M5.25 2.25l2.25 1.5 2.25-1.5L12 3.75l2.25-1.5 2.25 1.5 2.25-1.5v19.5l-2.25-1.5-2.25 1.5L12 20.25l-2.25 1.5-2.25-1.5-2.25 1.5Z";
put(
  "receipt",
  S(receipt) + S("M8.25 8.25h7.5M8.25 12h7.5M8.25 15.75h4.5"),
  F(
    receipt +
      box(8.25, 7.5, 7.5, 1.5) +
      box(8.25, 11.25, 7.5, 1.5) +
      box(8.25, 15, 4.5, 1.5),
  ) + S(receipt),
);
// Redo mirrors the circular undo arrow; refresh retains one circular arrow.
put("redo", S("M20.25 3.75v6h-6M20.25 9.75a8.25 8.25 0 1 0-7.5 11.25"));
put(
  "refresh",
  S("M20.5 8C19 4.6 16 2.5 12 2.5A9.5 9.5 0 1 0 21.15 14.5M14.5 8H20.5V2.5"),
);
put("remove", S("M2.25 12h19.5"));
const removeDocumentPage = "M3.75 2.25H15.75L20.25 6.75V21.75H3.75Z";
put(
  "remove-document",
  SF(removeDocumentPage + "M15.75 2.25V6.75H20.25") +
    L(8.25, 14.25, 15.75, 14.25),
  // Keep the page rim so fitting preserves the fold and minus anchors.
  // The inverse fold and minus retain their intentional fixed apertures.
  F(
    removeDocumentPage +
      "M15.75 3.75V6Q15.75 6.75 16.5 6.75H18.75Z" +
      box(8.25, 13.5, 7.5, 1.5),
  ) + SF(removeDocumentPage),
);
put("remove-user", actionPerson + L(15.75, 11.25, 21.75, 11.25));
for (const number of ["5", "10", "15", "30"]) {
  put(`replay-${number}`, numberedTimer(number, "replay"));
}
put(
  "restore",
  SF("M3.75 11.25v-7.5h16.5v16.5h-7.5M3.75 6.75h16.5M12 12L3.75 20.25m0-6v6h6"),
);
put(
  "run-report",
  SF(
    "M3.75 2.25H15.75L20.25 6.75V21.75H3.75ZM15.75 2.25V6.75H20.25",
  ) + F("M9 10.5l6.75 4.125L9 18.75Z"),
  F(
    "M3.75 2.25H15.75L20.25 6.75V21.75H3.75ZM15.75 3.75V6Q15.75 6.75 16.5 6.75H18.75ZM9 10.5v8.25l6.75-4.125Z",
  ),
);
// Bottle shoulders and a perforated cap distinguish the pouring shaker from a block.
const shaker =
  "M8 3.75H16Q17 3.75 17 4.75V10.5Q17 11.25 16.25 12L14.25 14V14.75H9.75V14L7.75 12Q7 11.25 7 10.5V4.75Q7 3.75 8 3.75Z";
const shakerCap =
  "M8.5 15.5H15.5V17.75Q15.5 18.5 14.75 18.5H9.25Q8.5 18.5 8.5 17.75Z";
const shakerHoles = circ(10.5, 17, 0.65) + circ(13.5, 17, 0.65);
const shakerPowder = "M10.6 11.3L14.1 7.8V11.3Z";
const fallingSalt = F(
  box(4.25, 18, 1.2, 1.2) + box(2.5, 20.8, 1.2, 1.2) + box(6.25, 21, 1.2, 1.2),
);
put(
  "salt-shaker",
  group(
    S(shaker) + F(shakerCap + shakerHoles) + F(shakerPowder),
    "rotate(45 12 12)",
  ) + fallingSalt,
  // Retain the bottle rim so filling it cannot move the cap or grains.
  group(
    F(shaker + shakerPowder) + S(shaker) + F(shakerCap + shakerHoles),
    "rotate(45 12 12)",
  ) + fallingSalt,
);
// Uniformly inset counters keep both saved-label panels centered in their frames.
const save = "M3.75 3.75h13.5l3 3v13.5H3.75Z";
const savePanels = "M8.25 3.75v6h7.5v-6M6.75 20.25v-6h10.5v6";
const saveJoins = [8.25, 15.75].map((x) =>
  circularCrossJunction(x, 3.75, 1.5, undefined, [[-1, 1], [1, 1]]),
).join("") + [6.75, 17.25].map((x) =>
  circularCrossJunction(x, 20.25, 1.5, undefined, [[-1, -1], [1, -1]]),
).join("");
const saveFrame = SF(save) + SF(savePanels) + saveJoins;
put(
  "save",
  saveFrame,
  F(save + box(8.25, 3.75, 7.5, 6) + box(6.75, 14.25, 10.5, 6)) + saveFrame,
);
// An analogue weighing scale: top platform, tapered base and pointer dial.
const weighingScale =
  "M6.5 7H17.5Q18 7 18.1 7.6L20.5 21H3.5L5.9 7.6Q6 7 6.5 7Z";
const scalePlatform =
  S("M5.5 3.5H18.5M12 3.5V7") +
  circularCrossJunction(12, 3.5, 1.65, undefined, [
    [-1, 1],
    [1, 1],
  ]) +
  circularCrossJunction(12, 7, 1.65, undefined, [
    [-1, -1],
    [1, -1],
  ]);
const scaleNeedle = S("M12 10.5V14.25");
put(
  "scales",
  SF(weighingScale, { turns: "all" }) + scalePlatform + C(12, 14.25, 3.75) + scaleNeedle,
  F(weighingScale + circ(12, 14.25, 3.75)) +
    SF(weighingScale, { turns: "all" }) +
    scalePlatform +
    scaleNeedle,
);
// The existing education pictogram is a mortarboard, including its tassel.
const mortarboard = "M12 3.25L21.25 8.75L12 14.25L2.75 8.75Z";
// The lower cap opening follows a parallel offset of the mortarboard edges.
// Preserve the cap opening after restoring the mortarboard rim, calibrated
// at W = 7/6 in the shared school frame.
const lowerCapTop = 17.097879;
const lowerCapSide = lowerCapTop - (6.75 * 5.5) / 9.25;
const tassel = S("M21.25 8.75V14.75") +
  angledJunction(21.25, 8.75, [0, 1], [-9.25, 5.5], 1.5);
put(
  "school",
  S(mortarboard) + S(`M5.25 ${lowerCapSide}V16.25L12 20L18.75 16.25V${lowerCapSide}`) + tassel,
  F(
    `${mortarboard}M5.25 ${lowerCapSide}L12 ${lowerCapTop}L18.75 ${lowerCapSide}V16.25L12 20L5.25 16.25Z`,
  ) +
    S(mortarboard) +
    S(`M5.25 ${lowerCapSide}V16.25L12 20L18.75 16.25V${lowerCapSide}`) +
    tassel,
);
const searchHandle =
  S("M15.3 15.3l6.45 6.45") + radialCircleJunction(10.5, 10.5, 6.75, 1.8, 45);
put(
  "search",
  opticalScale(C(10.5, 10.5, 6.75) + searchHandle, 1.125),
  // The filled lens, inverse glint and shared handle use the same optical fit.
  opticalScale(
    F(
      circ(10.5, 10.5, 6.75) +
        "M10.5 6A4.5 4.5 0 0 1 15 10.5H16.5A6 6 0 0 0 10.5 4.5Z",
    ) +
      C(10.5, 10.5, 6.75) +
      searchHandle,
    1.125,
  ),
);
// Reuse final facial contours after each circle has been fitted.
for (const [expression, [features, inverseFeatures]] of Object.entries(
  faceMarks,
)) {
  put(
    `semantic-${expression}`,
    withSharedMark(C(12, 12, 9.75), features),
    withSharedMark(F(circ(12, 12, 9.75)), inverseFeatures, true),
  );
}
const send = "M2.25 3.75L20.75 12L2.25 20.25L5.25 12Z";
put(
  "send",
  S(send) + S("M5.25 12h15.5"),
  // Complete exterior paint from the shared outline at W = 7/6, followed by
  // the established final tapered seam. One contour keeps the rear mouth
  // clean at every weight; no independently clipped rim cap crosses it.
  retainedFill(
    "M0.730617 2.119201L22.887559 12L0.730617 21.880799L3.98048 12.943676L19.079288 12L3.98048 11.056324Z",
  ),
);
// Six symmetric teeth retain the clear gear silhouette around a centered bore.
// Each side valley is one continuous circular transition. Two close
// corners on a short vertical segment forced their former fillets to vanish
// beneath heavy paint. The valley radius keeps a visible concavity through
// W=1.5; the six tooth faces and exterior points remain unchanged.
const gearClean = concavePolygon([
  [9.75, 2.25], [14.25, 2.25], [14.25, 5.25], [16.5, 6.75],
  [19.5, 5.25], [21.75, 9.75], [17.25, 12],
  [21.75, 14.25], [19.5, 18.75], [16.5, 17.25], [14.25, 18.75],
  [14.25, 21.75], [9.75, 21.75], [9.75, 18.75], [7.5, 17.25],
  [4.5, 18.75], [2.25, 14.25], [6.75, 12],
  [2.25, 9.75], [4.5, 5.25], [7.5, 6.75], [9.75, 5.25],
], (i) => i === 6 || i === 17 ? 1.6 : 1.2, undefined,
new Map([[6, .8], [17, .8]]));
// The filled gear retains the same teeth and bore center. Its 2.75-unit
// counter is a modest optical opening within the outlined 3-unit bore;
// the old 3.75-unit hole expanded again under independent export fitting.
put(
  "settings",
  S(gearClean) + C(12, 12, 3),
  F(gearClean + circ(12, 12, 2.75)) + S(gearClean),
);
const shareRadius = 3.25;
const shareNodes = [
  [5.25, 12],
  [18.75, 4.5],
  [18.75, 19.5],
];
// Radial attachments meet the enlarged nodes without entering their counters.
const shareLines = shareNodes
  .slice(1)
  .map(([x, y]) => {
    const [originX, originY] = shareNodes[0];
    const distance = Math.hypot(x - originX, y - originY);
    const offsetX = ((x - originX) * shareRadius) / distance;
    const offsetY = ((y - originY) * shareRadius) / distance;
    const angle = (Math.atan2(y - originY, x - originX) * 180) / Math.PI;
    return (
      L(originX + offsetX, originY + offsetY, x - offsetX, y - offsetY) +
      radialCircleJunction(originX, originY, shareRadius, 1.65, angle) +
      radialCircleJunction(x, y, shareRadius, 1.65, angle + 180)
    );
  })
  .join("");
put(
  "share",
  shareLines + shareNodes.map(([x, y]) => C(x, y, shareRadius)).join(""),
  shareLines +
    F(shareNodes.map(([x, y]) => circ(x, y, shareRadius)).join("")) +
    shareNodes.map(([x, y]) => C(x, y, shareRadius)).join(""),
);
put(
  "signal",
  S(
    "M6 4.5a9.75 9.75 0 0 0 0 15M18 4.5a9.75 9.75 0 0 1 0 15M8.25 7.5a6 6 0 0 0 0 9M15.75 7.5a6 6 0 0 1 0 9",
  ) + dot(12, 12, 1.5),
);
put(
  "signature",
  weldedCross(3.75, 15, 1.875, 1.875, 1.1, 1.05) +
    S(
      "M7.5 17.25C10.5 15 15.5 6.5 14 4.25C12.5 1.75 9.25 9.5 9.25 14.75C9.25 18.5 12 18.5 13.5 15.5L15 12.75C14.25 16.5 15.75 17 17.25 15L18.5 13.5C17.75 17 19.25 17 21.75 15",
    ) +
    [4.5, 8.25, 12, 15.75, 19.5]
      .map((x) => F(box(x - 1.125, 19.875, 2.25, 2.25)))
      .join(""),
);
const post =
  "M11.25 5.25H18l3.75 3L18 11.25h-6.75ZM11.25 11.25H6l-3.75 3L6 17.25h5.25Z";
const signpostJoins =
  circularCrossJunction(11.25, 5.25, 1.8, undefined, [
    [1, -1],
    [1, 1],
  ]) +
  circularCrossJunction(11.25, 11.25, 1.8) +
  circularCrossJunction(11.25, 17.25, 1.8, undefined, [
    [-1, -1],
    [-1, 1],
  ]);
put(
  "signpost",
  S(post) + S("M11.25 2.25v19.5") + signpostJoins,
  F(post) + S(post) + S("M11.25 2.25v19.5") + signpostJoins,
);
const sliderLines = S(
  "M2.25 6.75h9M17.25 6.75h4.5M2.25 17.25h3M11.25 17.25h10.5",
);
put(
  "slide",
  sliderLines + C(14.25, 6.75, 3) + C(8.25, 17.25, 3),
  sliderLines + F(circ(14.25, 6.75, 3.75) + circ(8.25, 17.25, 3.75)),
);
put(
  "sort",
  S(
    "M6.75 21V3M3 6.75L6.75 3l3.75 3.75M17.25 3v18M13.5 17.25L17.25 21 21 17.25",
  ),
);
const sortArrow = S("M18 20.25V3.75M14.25 7.5L18 3.75l3.75 3.75") + arrowRoot(18, 3.75, [0, 1], 1.45);
const sortAlphaArrow = group(sortArrow, "rotate(180 18 12)");
put(
  "sort-alpha-ascend",
  sortAlphaArrow +
    textLabel("A", 5.5, 3, 6.5, { align: "center" }) +
    textLabel("Z", 5.5, 14.5, 6.5, { align: "center" }),
);
put(
  "sort-alpha-descend",
  sortAlphaArrow +
    textLabel("Z", 5.5, 3, 6.5, { align: "center" }) +
    textLabel("A", 5.5, 14.5, 6.5, { align: "center" }),
);
put("sort-ascend", sortArrow + S("M2.25 5.25h3M2.25 12h6M2.25 18.75h9"));

// Exact center of the retained SVG redo arc. The curved head bridges
// are tangent to that arc rather than projecting straight caps beside it.
const redoCenter = (() => {
  const dx = 3.75, dy = -5.625;
  const factor = Math.sqrt((8.25 ** 2 - dx ** 2 - dy ** 2) / (dx ** 2 + dy ** 2));
  return [16.5 + factor * dy, 15.375 - factor * dx];
})();
const redoJoins = circularHeadJoins(...redoCenter, 8.25,
  Math.atan2(9.75 - redoCenter[1], 20.25 - redoCenter[0]), -1,
  [[0, -3.6], [-3.6, 0]], .36);
icons.redo[0] += redoJoins;
icons.refresh[0] += cubicHeadJoins([[20.5, 8], [19, 4.6], [16, 2.5], [12, 2.5]],
  [[-3.6, 0], [0, -3.6]], .42);

// Arrow roots retain their welds; B frame turns are styled by their owning contours.
const straightHeadJoins = {
  "message-forward": arrowRoot(18.75, 8.25, [-1, 0], 1.6),
  "message-reply": arrowRoot(5.25, 8.25, [1, 0], 1.6),
  "message-reply-all": arrowRoot(11.25, 8.25, [1, 0], 1.6) +
    angledJunction(5.25, 8.25, [1, -1], [1, 1], 1.8),
  "move-horizontal": arrowRoot(2.25, 12, [1, 0], 1.6) + arrowRoot(21.75, 12, [-1, 0], 1.6),
  "move-vertical": arrowRoot(12, 2.25, [0, 1], 1.6) + arrowRoot(12, 21.75, [0, -1], 1.6),
  "move-all": arrowRoot(2.25, 12, [1, 0], 1.25) + arrowRoot(21.75, 12, [-1, 0], 1.25) +
    arrowRoot(12, 2.25, [0, 1], 1.25) + arrowRoot(12, 21.75, [0, -1], 1.25),
  "place-in": arrowRoot(10.5, 13.5, [1, -1], 1.6),
  "restore": arrowRoot(3.75, 20.25, [1, -1], 1.6) +
    circularCrossJunction(3.75, 6.75, 1.65, undefined, [[1, -1], [1, 1]]) +
    circularCrossJunction(20.25, 6.75, 1.65, undefined, [[-1, -1], [-1, 1]]),
  "sort": arrowRoot(6.75, 3, [0, 1], 1.45) + arrowRoot(17.25, 21, [0, -1], 1.45),
  "outdent": angledJunction(3, 12, [1, -1], [1, 1], 2),
};
for (const [name, joins] of Object.entries(straightHeadJoins))
  icons[name] = icons[name].map((drawing) => drawing ? drawing + joins : drawing);

export default icons;
