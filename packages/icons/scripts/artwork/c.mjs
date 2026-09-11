import { numberedTimer } from "./numbered-timer.mjs";
import {
  box,
  C,
  circ,
  dot,
  F,
  group,
  L,
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
  const arrow = reply
    ? "M20.25 20.25v-5.25a6.75 6.75 0 0 0-6.75-6.75H5.25M9.75 3.75l-4.5 4.5 4.5 4.5"
    : "M3.75 20.25V15a6.75 6.75 0 0 1 6.75-6.75h8.25M14.25 3.75l4.5 4.5-4.5 4.5";
  return kind === "reply-all"
    ? S(
        "M20.25 20.25V15a6.75 6.75 0 0 0-6.75-6.75H8.25M12.75 3.75l-4.5 4.5 4.5 4.5M6.75 3.75l-4.5 4.5 4.5 4.5",
      )
    : S(arrow);
};
for (const k of ["forward", "reply", "reply-all"])
  put(`message-${k}`, messageAction(k));
put(
  "micro-menu",
  [5.25, 12, 18.75].map((y) => F(box(10.875, y - 1.125, 2.25, 2.25))).join(""),
);
put(
  "overflow-menu",
  [5.25, 12, 18.75].map((x) => F(box(x - 1.125, 10.875, 2.25, 2.25))).join(""),
);

const mic = box(8.25, 2.25, 7.5, 13.5, 3.75);
const micBase = S(
  "M5.25 10.5v1.5a6.75 6.75 0 0 0 13.5 0v-1.5M12 18.75v3M8.25 21.75h7.5",
);
put("microphone", S(mic) + micBase, F(mic) + micBase);
// Shared base geometry is cut only beneath the foreground mark.
put(
  "microphone-disabled",
  S(
    "M12 2.25L12 2.25Q15.75 2.25 15.75 6L15.75 11.50736M11.48862 15.73127Q8.49632 15.50368 8.26873 12.51138M8.51471 4.27207Q9.24632 2.25 12 2.25",
  ) +
    S(
      "M5.25 10.5L5.25 12C5.25 15.72792 8.27208 18.75 12 18.75C12.75384 18.75 13.47882 18.62642 14.15579 18.39843M18.39843 14.15579C18.62642 13.47882 18.75 12.75384 18.75 12L18.75 10.5M12 18.75L12 21.75M8.25 21.75L15.75 21.75",
    ) +
    S("M3 3L21 21"),
  F(
    "M12.0 2.25Q15.75 2.25 15.75 6.0V12.0Q15.75 12.549172401428223 15.669574737548828 13.017925262451172L8.260754585266113 5.609104633331299Q8.450824737548828 2.25 12.0 2.25ZM8.25 10.901650428771973 13.017925262451172 15.669574737548828Q12.549172401428223 15.75 12.0 15.75Q8.25 15.75 8.25 12.0V10.901650428771973Z",
  ) +
    S(
      "M5.25 10.5L5.25 12C5.25 15.72792 8.27208 18.75 12 18.75C12.75384 18.75 13.47882 18.62642 14.15579 18.39843M18.39843 14.15579C18.62642 13.47882 18.75 12.75384 18.75 12L18.75 10.5M12 18.75L12 21.75M8.25 21.75L15.75 21.75",
    ) +
    S("M3 3L21 21"),
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
// Open stems share the primary stroke; only the closed beam and notes fill.
const musicSolid =
  musicStems + F(`M9.75 5.25L20.25 2.25V6.75L9.75 9.75Z${musicNotes}`);
put("music", musicOutline, musicSolid);
// Shared centerlines are interrupted for the foreground slash; filled surfaces
// use a true 2.5px transparent corridor at the 16px master size.
const musicDisabledStems = S(
  "M9.75 16.5L9.75 15.49264M9.75 7.00736L9.75 5.25L20.25 2.25L20.25 15M11.88316 9.14052L20.25 6.75",
);
put(
  "music-disabled",
  musicDisabledStems +
    S(
      "M9.75 16.5C9.75 18.15 8.05 19.5 6 19.5C3.95 19.5 3 18.45 3 17.25C3 16.05 4.7 14.25 6.75 14.25C8.8 14.25 9.75 15.3 9.75 16.5M20.25 15C20.25 15.66206 19.9763 16.27583 19.5161 16.77346M15.79458 13.05194C16.24349 12.86328 16.73573 12.75 17.25 12.75C19.3 12.75 20.25 13.8 20.25 15",
    ) +
    S("M2.25 3.75L21 22.5"),
  musicDisabledStems +
    F(
      "M9.75 5.25 20.25 2.25V6.75L10.64573 9.49408L9.75 8.59835ZM9.75 16.5C9.75 18.15 8.05 19.5 6 19.5C3.95 19.5 3 18.45 3 17.25C3 16.05 4.7 14.25 6.75 14.25C8.8 14.25 9.75 15.3 9.75 16.5ZM20.25 15C20.25 16.02007 19.60026 16.92547 18.61977 17.46812L14.79474 13.64309C15.45561 13.12323 16.31652 12.75 17.25 12.75C19.3 12.75 20.25 13.8 20.25 15Z",
    ) +
    S("M2.25 3.75L21 22.5"),
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
put("notification", S(bell) + bellTip, F(bell) + bellTip);
// Shared base geometry is cut only beneath the foreground mark.
put(
  "notification-read",
  S(
    "M6.75 9C6.75 6.10051 9.10051 3.75 12 3.75C13.98253 3.75 15.7084 4.8489 16.60173 6.47081M18.04137 13.93706L20.25 17.25L3.75 17.25L6.75 12.75L6.75 9",
  ) +
    S("M9.75 20.25L14.25 20.25M12 3.75L12 2.25") +
    S("M12.75 9L15.75 12 21 6"),
  F(
    "M6.75 9.0C6.75 6.1005048751831055 9.100504875183105 3.75 12.0 3.75C14.42960262298584 3.75 16.47373390197754 5.400391101837158 17.07246971130371 7.641245365142822L15.658668518066406 9.25701904296875L13.280324935913086 6.8786749839782715L10.62867546081543 9.530324935913086L15.841331481933594 14.742981910705566L17.394947052001953 12.967421531677246L20.25 17.25H3.75L6.75 12.75Z",
  ) +
    S("M9.75 20.25L14.25 20.25M12 3.75L12 2.25") +
    S("M12.75 9L15.75 12 21 6"),
);
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
put("picnic", S(picnicTree) + picnicBase, F(picnicTree) + picnicBase);
const pin =
  "M8.25 3.75h7.5v3l-1.5 1.5v4.5l3 3v1.5H6.75v-1.5l3-3v-4.5l-1.5-1.5Z";
const pinPoint = S("M12 17.25v4.5");
put("pin", S(pin) + pinPoint, F(pin) + pinPoint);
const pivotArrow = S(
  "M6.75 15.25H14.75V7M11.75 10L14.75 7L17.75 10M9.75 12.25L6.75 15.25L9.75 18.25",
);
put(
  "pivot",
  R(2.25, 2.25, 19.5, 19.5) + pivotArrow,
  // The original solid is a filled panel with the same arrow as a 1px inverse detail.
  F(
    box(2.25, 2.25, 19.5, 19.5) +
      "M11.21967 9.46967 14.75 5.93934 18.28033 9.46967 17.21967 10.53033 15.5 8.81066V16H8.56066L10.28033 17.71967L9.21967 18.78033L5.68934 15.25L9.21967 11.71967L10.28033 12.78033L8.56066 14.5H14V8.81066L12.28033 10.53033Z",
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
      box(3, 6.75, 18, 1.5) +
      box(6.5, 10.25, 11, 1.5, 0.3) +
      box(6.5, 13.75, 11, 1.5, 0.3),
  ) + presentationLegs,
);
put(
  "price-ladder",
  S(
    "M6.75 2.25v19.5M17.25 2.25v19.5M6.75 6.75h10.5M6.75 12h10.5M6.75 17.25h10.5",
  ),
);
const printTop = S("M6.75 8.25v-6h10.5v6");
put(
  "print",
  S("M6.75 17.25h-3v-9h16.5v9h-3") +
    printTop +
    R(6.75, 14.25, 10.5, 7.5) +
    L(8.25, 17.25, 15.75, 17.25) +
    dot(17.25, 11.25, 0.6),
  F(
    box(3, 7.5, 18, 10.5) +
      box(6.75, 14.25, 10.5, 3.75) +
      circ(17.25, 11.25, 0.75),
  ) +
    printTop +
    R(6.75, 14.25, 10.5, 7.5) +
    L(8.25, 17.25, 15.75, 17.25),
);

const progressDisk = (holes) => F(circ(12, 12, 9.75) + holes);
put(
  "progress-cancelled",
  progressDisk(
    "M8.3 7.25L12 10.95l3.7-3.7 1.05 1.05-3.7 3.7 3.7 3.7-1.05 1.05-3.7-3.7-3.7 3.7-1.05-1.05 3.7-3.7-3.7-3.7Z",
  ),
);
put("progress-closed", progressDisk(box(7.5, 7.5, 9, 9)) + F(box(9, 9, 6, 6)));
put(
  "progress-complete",
  progressDisk("M6.75 12l3.75 3.75 7.5-8.25 1.1 1-8.6 9.5-4.85-4.95Z"),
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
put("progress-rejected", progressDisk(box(6.75, 11.25, 10.5, 1.5)));
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
  ),
);
// Redo mirrors the circular undo arrow; refresh retains one circular arrow.
put("redo", S("M20.25 3.75v6h-6M20.25 9.75a8.25 8.25 0 1 0-7.5 11.25"));
put(
  "refresh",
  S("M20.5 8C19 4.6 16 2.5 12 2.5A9.5 9.5 0 1 0 21.15 14.5M14.5 8H20.5V2.5"),
);
put("remove", S("M3.75 12h16.5"));
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
// The dispensing cap faces the falling grains: a pouring salt shaker.
const shaker =
  "M8.5 4H15.5Q16.25 4 16.25 4.75V14.25L15.25 16H8.75L7.75 14.25V4.75Q7.75 4 8.5 4Z";
const shakerCap =
  "M8.75 16H15.25V17.25Q15.25 18 14.5 18H9.5Q8.75 18 8.75 17.25Z";
const shakerPowder = "M10.6 11.3L14.1 7.8V11.3Z";
const fallingSalt = F(
  box(4.25, 18, 1.2, 1.2) + box(2.5, 20.8, 1.2, 1.2) + box(6.25, 21, 1.2, 1.2),
);
put(
  "salt-shaker",
  group(S(shaker) + S(shakerCap) + F(shakerPowder), "rotate(45 12 12)") +
    fallingSalt,
  group(
    F(shaker + shakerPowder) +
      F("M8.75 16.75H15.25V17.25Q15.25 18 14.5 18H9.5Q8.75 18 8.75 17.25Z"),
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
const lowerCapTop = 16.1;
const lowerCapSide = lowerCapTop - (6.75 * 5.5) / 9.25;
const tassel = S("M21.25 8.75V14.75");
put(
  "school",
  S(mortarboard) + S("M5.25 10.2365V16.25L12 20L18.75 16.25V10.2365") + tassel,
  F(
    `${mortarboard}M5.25 ${lowerCapSide}L12 ${lowerCapTop}L18.75 ${lowerCapSide}V16.25L12 20L5.25 16.25Z`,
  ) + tassel,
);
const searchHandle = S("M15.3 15.3l6.45 6.45");
put(
  "search",
  C(10.5, 10.5, 6.75) + searchHandle,
  // Retain the original filled lens and inverse glint, with the shared handle.
  F(
    circ(10.5, 10.5, 7.5) +
      "M10.5 6A4.5 4.5 0 0 1 15 10.5H16.5A6 6 0 0 0 10.5 4.5Z",
  ) + searchHandle,
);
// The solid face uses fixed transparent counters around its facial features.
// Closed mouth areas and pupil centers keep the same expression geometry.
const faces = {
  dissatisfied: [
    "M7.5 16.5q4.5-4.5 9 0",
    "M6.96967 15.96967Q9.48483 13.4545 12 13.4545Q14.51517 13.4545 17.03033 15.96967L15.96967 17.03033Q12 13.06066 8.03033 17.03033Z",
  ],
  neutral: ["M7.5 15.75h9", box(7.5, 15, 9, 1.5)],
  satisfied: [
    "M7.5 14.25q4.5 4.5 9 0",
    "M8.03033 13.71967Q12 17.68934 15.96967 13.71967L17.03033 14.78033Q14.56066 17.25 12 17.25Q9.43934 17.25 6.96967 14.78033Z",
  ],
  "very-dissatisfied": [
    "M7.5 18q4.5-6 9 0M6.75 8.25l3 1.5M14.25 9.75l3-1.5",
    "M6.9 17.55Q9.375 14.25 12 14.25Q14.625 14.25 17.1 17.55L15.9 18.45Q13.875 15.75 12 15.75Q10.125 15.75 8.1 18.45ZM13.91459 9.07918 16.91459 7.57918 17.58541 8.92082 14.58541 10.42082ZM7.08541 7.57918 10.08541 9.07918 9.41459 10.42082 6.41459 8.92082Z",
  ],
  "very-satisfied": [
    "M6.75 13.5h10.5a5.25 5.25 0 0 1-10.5 0ZM6.75 9.75q1.5-3 3 0M14.25 9.75q1.5-3 3 0",
    "M6.75 13.5h10.5a5.25 5.25 0 0 1-10.5 0ZM13.57918 9.41459Q14.53648 7.5 15.75 7.5Q16.96353 7.5 17.92082 9.41459L16.57918 10.08541Q16.03647 9 15.75 9Q15.46353 9 14.92082 10.08541ZM6.07918 9.41459Q7.03647 7.5 8.25 7.5Q9.46353 7.5 10.42082 9.41459L9.07918 10.08541Q8.53648 9 8.25 9Q7.96353 9 7.42082 10.08541Z",
  ],
};
for (const [expression, [mouth, counter]] of Object.entries(faces)) {
  const plainEyes = !expression.startsWith("very");
  put(
    `semantic-${expression}`,
    C(12, 12, 9.75) +
      S(mouth) +
      (plainEyes ? dot(8.25, 9, 0.75) + dot(15.75, 9, 0.75) : ""),
    F(
      circ(12, 12, 9.75) +
        counter +
        (plainEyes ? circ(8.25, 9, 0.75) + circ(15.75, 9, 0.75) : ""),
    ),
  );
}
const send = "M2.25 3.75L20.75 12L2.25 20.25L5.25 12Z";
put(
  "send",
  S(send) + S("M5.25 12h15.5"),
  F(`${send}M5.25 11.25L17.25 12L5.25 12.75Z`),
);
// Six symmetric teeth retain the clear gear silhouette around a centered bore.
const gearClean =
  "M9.75 2.25H14.25V5.25L16.5 6.75L19.5 5.25L21.75 9.75L18.75 11.25V12.75L21.75 14.25L19.5 18.75L16.5 17.25L14.25 18.75V21.75H9.75V18.75L7.5 17.25L4.5 18.75L2.25 14.25L5.25 12.75V11.25L2.25 9.75L4.5 5.25L7.5 6.75L9.75 5.25Z";
put("settings", S(gearClean) + C(12, 12, 3), F(gearClean + circ(12, 12, 3.75)));
const shareLines = S("M7.5 10.5l9-5.25M7.5 13.5l9 5.25");
put(
  "share",
  shareLines +
    C(5.25, 12, 2.625) +
    C(18.75, 4.5, 2.625) +
    C(18.75, 19.5, 2.625),
  shareLines +
    F(
      circ(5.25, 12, 3.375) +
        circ(18.75, 4.5, 3.375) +
        circ(18.75, 19.5, 3.375),
    ),
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
  F(post) + S("M11.25 2.25v19.5"),
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
