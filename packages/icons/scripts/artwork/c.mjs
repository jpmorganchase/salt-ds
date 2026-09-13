import { notificationRead } from "./action-marks.mjs";
import { enclosedDot, enclosedTick } from "./enclosed-marks.mjs";
import { faceMarks } from "./face-marks.mjs";
import { standaloneMark, withSharedMark } from "./mark-composition.mjs";
import { numberedTimer } from "./numbered-timer.mjs";
import {
  box,
  C,
  circ,
  dot,
  F,
  group,
  L,
  opticalScale,
  R,
  S,
  textLabel,
} from "./primitives.mjs";

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
  S(envelope) +
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
const micBase = S(
  "M5.25 10.5v1.5a6.75 6.75 0 0 0 13.5 0v-1.5M12 18.75v3M8.25 21.75h7.5",
);
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
  micDisabledCapsule + micDisabledSupport + S("M3 3L21 21");
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
  S(mouse) + S("M5.25 12h13.5") + S(box(10.5, 5.5, 3, 3.5, 0.75), 1.125),
  F(mouse + box(10.5, 5.5, 3, 3.5, 0.75) + box(6.75, 11.25, 10.5, 1.5)),
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
  ),
);
put("multiply", cross(12, 12, 6.75));

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
put("not-allowed", C(12, 12, 9) + S("M5.65 5.65l12.7 12.7"));
const note = "M3.75 3.75h16.5v10.5l-6 6H3.75Z";
put(
  "note",
  S(note) + S("M14.25 20.25v-6h6M6.75 8.25h10.5M6.75 11.25h6"),
  F(
    note +
      box(6, 7.5, 12, 1.5) +
      box(6, 10.5, 7.5, 1.5) +
      "M14.25 18.75l4.5-4.5h-4.5Z",
  ),
);
const bell = "M6.75 9a5.25 5.25 0 0 1 10.5 0v3.75l3 4.5H3.75l3-4.5Z";
const bellTip = S("M9.75 20.25h4.5M12 3.75v-1.5");
// Fill inside the retained bell perimeter so its crown and clapper stay fixed.
put("notification", S(bell) + bellTip, F(bell) + S(bell) + bellTip);
put("notification-read", ...notificationRead);
put(
  "outdent",
  S(
    "M3 3.75H21M3 20.25H21M11.25 9.75H21M11.25 14.25H21M6.75 8.25L3 12l3.75 3.75",
  ),
);
const clipboard = "M7.5 3.75H3.75v18h16.5v-18h-3.75";
put(
  "paste",
  S(clipboard) + R(7.5, 2.25, 9, 4.5) + S("M7.5 11.25h9M7.5 15.75h9"),
  F(
    box(3, 3.75, 18, 18) +
      box(7.5, 3.75, 9, 3) +
      box(6.75, 10.5, 10.5, 1.5) +
      box(6.75, 15, 10.5, 1.5),
  ) + R(7.5, 2.25, 9, 4.5),
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
const picnicBase = S(
  "M2.25 21.75h19.5M17.25 11.25v10.5M2.25 14.25h9M5.25 14.25v7.5M2.25 18.75h6",
);
// Retain the tree perimeter in both styles so filling the canopy does not
// rescale or move the shared bench, trunk and ground after export fitting.
put(
  "picnic",
  S(picnicTree) + picnicBase,
  S(picnicTree) + F(picnicTree) + picnicBase,
);
// A flat head, straight neck and wider flange distinguish the tack from an
// hourglass. The diagonal presentation separates its head from the long needle.
const pin = "M8.25 3h7.5v3H14.25v6.75l3 3V17.25H6.75v-1.5l3-3V6H8.25Z";
const pinPoint = S("M12 17.25v5.25");
put(
  "pin",
  group(S(pin) + pinPoint, "rotate(45 12 12)"),
  group(F(pin) + S(pin) + pinPoint, "rotate(45 12 12)"),
);
const pivotArrow = S(
  "M6.75 15.25H14.75V7M11.75 10L14.75 7L17.75 10M9.75 12.25L6.75 15.25L9.75 18.25",
);
put(
  "pivot",
  R(2.25, 2.25, 19.5, 19.5) + pivotArrow,
  // Keep the outlined arrow's centerlines and endpoints. A 1.8-unit inverse
  // width gives its arrowheads enough emphasis at 12px inside the filled panel.
  F(
    box(2.25, 2.25, 19.5, 19.5) +
      "M11.113604 9.363604 14.75 5.727208 18.386396 9.363604 17.113604 10.636396 15.65 9.172792V16.15H8.922792L10.386396 17.613604L9.113604 18.886396L5.477208 15.25L9.113604 11.613604L10.386396 12.886396L8.922792 14.35H13.85V9.172792L12.386396 10.636396Z",
  ),
);
put("place-in", S("M12 3.75H3.75v16.5h16.5V12M21 3L10.5 13.5m0-6v6h6"));
const play = "M6.75 3.75l13.5 8.25-13.5 8.25Z";
put("play", S(play), F(play));
put(
  "policy",
  S("M11.25 21.75h-6V2.25H15l3.75 3.75") +
    S("M15 2.25V6h3.75") +
    S("M8.25 8.25h3M8.25 12.75h3") +
    S("M15 17.25V21.75L18 20.85L21 21.75V17.25", 1.08) +
    C(18, 13.5, 4.5),
);
// The original open food bowl retains its contents and rising steam.
const pot =
  "M4.5 10.5H19.5V12.75C19.5 16.89 16.14 19.5 12 19.5S4.5 16.89 4.5 12.75Z";
const potFood = F("M6.75 10.5C7.5 8.25 11.25 8.25 12 10.5Z");
const potDetails =
  S(
    "M2.25 12H4.5M19.5 12H21.75M16.5 2.25C16.5 4.25 15 5.5 15 7.5M20.25 2.25C20.25 4.25 18.75 5.5 18.75 7.5",
  ) + F(box(8.25, 19.5, 7.5, 2.25));
put("pot-food", S(pot) + potFood + potDetails, F(pot) + potFood + potDetails);
// A presentation board stands on an easel, rather than a monitor pedestal.
const presentationLegs = S("M7.5 22L12 18L16.5 22");
const presentationBoard = box(3, 3.5, 18, 14.5);
put(
  "presentation",
  S(presentationBoard) + S("M3 7.5H21M7 11H17M7 14.5H17") + presentationLegs,
  F(
    presentationBoard +
      box(4.5, 6.75, 15, 1.5) +
      box(6.5, 10.25, 11, 1.5, 0.3) +
      box(6.5, 13.75, 11, 1.5, 0.3),
  ) +
    S(presentationBoard) +
    presentationLegs,
);
put(
  "price-ladder",
  S(
    "M6.75 2.25v19.5M17.25 2.25v19.5M6.75 6.75h10.5M6.75 12h10.5M6.75 17.25h10.5",
  ),
);
// The broad housing and two open sheets carry the printer at small sizes.
const printTop = S("M6.75 8.25v-6h10.5v6");
const printOutput = R(6.75, 14.25, 10.5, 7.5);
put(
  "print",
  S("M6.75 17.25H3v-9h18v9h-3.75") + printTop + printOutput,
  F(box(2.25, 7.5, 19.5, 10.5) + box(6.75, 14.25, 10.5, 3.75)) +
    printTop +
    printOutput,
);

const progressDisk = (holes) => F(circ(12, 12, 9.75) + holes);
// Peer status glyphs are optically balanced on the final canvas. Four-arm and
// closed-ring shapes need less thickness than the single minus or shared tick.
const progressMark = (mark) =>
  withSharedMark(F(circ(12, 12, 9.75)), mark, true);
const crossHalf = 1.75 / Math.SQRT2;
const progressCross = `M${5 - crossHalf} 5L5 ${5 - crossHalf}L8 ${8 - crossHalf}L11 ${5 - crossHalf}L${11 + crossHalf} 5L${8 + crossHalf} 8L${11 + crossHalf} 11L11 ${11 + crossHalf}L8 ${8 + crossHalf}L5 ${11 + crossHalf}L${5 - crossHalf} 11L${8 - crossHalf} 8Z`;
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
put(
  "remove-document",
  S(
    "M3.75 2.25H15.75L20.25 6.75V21.75H3.75ZM15.75 2.25V6Q15.75 6.75 16.5 6.75H20.25",
  ) + L(8.25, 14.25, 15.75, 14.25),
  F(
    "M3.75 2.25H15.75L20.25 6.75V21.75H3.75ZM15.75 3.75V6Q15.75 6.75 16.5 6.75H18.75Z" +
      box(8.25, 13.5, 7.5, 1.5),
  ),
);
put(
  "remove-user",
  C(10.5, 7, 3.25) +
    S(
      "M3.75 21V18C3.75 14.75 6.75 13.5 10.5 13.5C13.25 13.5 15.5 14.25 16.5 15.75M15.75 11.25h6",
    ),
);
for (const number of ["5", "10", "15", "30"]) {
  put(`replay-${number}`, numberedTimer(number, "replay"));
}
put(
  "restore",
  S("M3.75 11.25v-7.5h16.5v16.5h-7.5M3.75 6.75h16.5M12 12L3.75 20.25m0-6v6h6"),
);
put(
  "run-report",
  S(
    "M3.75 2.25H15.75L20.25 6.75V21.75H3.75ZM15.75 2.25V6Q15.75 6.75 16.5 6.75H20.25",
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
  group(
    F(shaker + shakerPowder) + F(shakerCap + shakerHoles),
    "rotate(45 12 12)",
  ) + fallingSalt,
);
// Uniformly inset counters keep both saved-label panels centered in their frames.
const save = "M3.75 3.75h13.5l3 3v13.5H3.75Z";
put(
  "save",
  S(save) + S("M8.25 3.75v6h7.5v-6M6.75 20.25v-6h10.5v6"),
  F(save + box(9, 4.5, 6, 4.5) + box(7.5, 15, 9, 4.5)),
);
// An analogue weighing scale: top platform, tapered base and pointer dial.
const weighingScale =
  "M6.5 7H17.5Q18 7 18.1 7.6L20.5 21H3.5L5.9 7.6Q6 7 6.5 7Z";
const scalePlatform = S("M5.5 3.5H18.5M12 3.5V7");
const scaleNeedle = S("M12 10.5V14.25");
put(
  "scales",
  S(weighingScale) + scalePlatform + C(12, 14.25, 3.75) + scaleNeedle,
  F(weighingScale + circ(12, 14.25, 3.75)) + scalePlatform + scaleNeedle,
);
// The existing education pictogram is a mortarboard, including its tassel.
const mortarboard = "M12 3.25L21.25 8.75L12 14.25L2.75 8.75Z";
// The lower cap opening follows a parallel offset of the mortarboard edges.
// Preserve the cap opening after restoring the mortarboard rim, calibrated
// at W = 7/6 in the shared school frame.
const lowerCapTop = 17.097879;
const lowerCapSide = lowerCapTop - (6.75 * 5.5) / 9.25;
const tassel = S("M21.25 8.75V14.75");
put(
  "school",
  S(mortarboard) + S("M5.25 10.2365V16.25L12 20L18.75 16.25V10.2365") + tassel,
  F(
    `${mortarboard}M5.25 ${lowerCapSide}L12 ${lowerCapTop}L18.75 ${lowerCapSide}V16.25L12 20L5.25 16.25Z`,
  ) +
    S(mortarboard) +
    S(`M5.25 ${lowerCapSide}V16.25L12 20L18.75 16.25V${lowerCapSide}`) +
    tassel,
);
const searchHandle = S("M15.3 15.3l6.45 6.45");
put(
  "search",
  opticalScale(C(10.5, 10.5, 6.75) + searchHandle, 1.125),
  // The filled lens, inverse glint and shared handle use the same optical fit.
  opticalScale(
    F(
      circ(10.5, 10.5, 7.5) +
        "M10.5 6A4.5 4.5 0 0 1 15 10.5H16.5A6 6 0 0 0 10.5 4.5Z",
    ) + searchHandle,
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
  F(
    "M0.730617 2.119201L22.887559 12L0.730617 21.880799L3.98048 12.943676L19.079288 12L3.98048 11.056324Z",
  ),
);
// Six symmetric teeth retain the clear gear silhouette around a centered bore.
const gearClean =
  "M9.75 2.25H14.25V5.25L16.5 6.75L19.5 5.25L21.75 9.75L18.75 11.25V12.75L21.75 14.25L19.5 18.75L16.5 17.25L14.25 18.75V21.75H9.75V18.75L7.5 17.25L4.5 18.75L2.25 14.25L5.25 12.75V11.25L2.25 9.75L4.5 5.25L7.5 6.75L9.75 5.25Z";
put("settings", S(gearClean) + C(12, 12, 3), F(gearClean + circ(12, 12, 3.75)));
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
    return L(originX + offsetX, originY + offsetY, x - offsetX, y - offsetY);
  })
  .join("");
put(
  "share",
  shareLines + shareNodes.map(([x, y]) => C(x, y, shareRadius)).join(""),
  shareLines +
    F(shareNodes.map(([x, y]) => circ(x, y, shareRadius + 0.75)).join("")),
);
put(
  "signal",
  S(
    "M6 4.5a9.75 9.75 0 0 0 0 15M18 4.5a9.75 9.75 0 0 1 0 15M8.25 7.5a6 6 0 0 0 0 9M15.75 7.5a6 6 0 0 1 0 9",
  ) + dot(12, 12, 1.5),
);
put(
  "signature",
  S("M1.875 13.125L5.625 16.875M5.625 13.125L1.875 16.875", 1.05) +
    S(
      "M7.5 17.25C10.5 15 15.5 6.5 14 4.25C12.5 1.75 9.25 9.5 9.25 14.75C9.25 18.5 12 18.5 13.5 15.5L15 12.75C14.25 16.5 15.75 17 17.25 15L18.5 13.5C17.75 17 19.25 17 21.75 15",
    ) +
    [4.5, 8.25, 12, 15.75, 19.5]
      .map((x) => F(box(x - 1.125, 19.875, 2.25, 2.25)))
      .join(""),
);
const post =
  "M11.25 5.25H18l3.75 3L18 11.25h-6.75ZM11.25 11.25H6l-3.75 3L6 17.25h5.25Z";
put(
  "signpost",
  S(post) + S("M11.25 2.25v19.5"),
  F(post) + S(post) + S("M11.25 2.25v19.5"),
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
const sortArrow = S("M18 20.25V3.75M14.25 7.5L18 3.75l3.75 3.75");
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

export default icons;
