import { stackoverflow, symphony } from "./brands.mjs";
import {
  box,
  C,
  circ,
  dot,
  F,
  group,
  italicLetter,
  L,
  R,
  S,
  slash,
  textLabel,
} from "./primitives.mjs";

const icons = {};
const put = (n, o, s) => {
  icons[n] = [o, s];
};
const down = S("M18 3.75V20.25M14.25 16.5L18 20.25L21.75 16.5");
const both = S(
  "M18 3.75V9.75M14.25 7.5L18 3.75L21.75 7.5M18 20.25V14.25M14.25 16.5L18 20.25L21.75 16.5",
);
put("sort-descend", S("M2.25 5.25h9M2.25 12h6M2.25 18.75h3") + down);
for (const [n, chars, arrow] of [
  ["sort-num-ascend", "19", down],
  ["sort-num-descend", "91", down],
  ["sortable-num", "19", both],
  ["sortable-alpha", "AZ", both],
])
  put(
    n,
    textLabel(chars[0], 5.5, 3, 6.5, { align: "center" }) +
      textLabel(chars[1], 5.5, 14.5, 6.5, { align: "center" }) +
      arrow,
  );
const star =
  "M11 3C12.4 8.8 13.2 9.6 19 11C13.2 12.4 12.4 13.2 11 19C9.6 13.2 8.8 12.4 3 11C8.8 9.6 9.6 8.8 11 3Z";
const littleStar =
  "M20 1.5L20.8 3.7 23 4.5 20.8 5.3 20 7.5 19.2 5.3 17 4.5 19.2 3.7Z";
put("sparkle", S(star) + F(littleStar), F(star) + F(littleStar));
// At 45 degrees, the corner bisector and circle tangent share a direction.
const refreshTipX = 12 + 9 / Math.SQRT2;
const refreshTipY = 12 - 9 / Math.SQRT2;
const refreshHead = 3.75;
const refresh = S(
  `M${refreshTipX} ${refreshTipY}A9 9 0 1 0 21 12M${refreshTipX - refreshHead} ${refreshTipY}H${refreshTipX}V${refreshTipY - refreshHead}`,
);
put(
  "sparkle-refresh",
  refresh + group(S(star), "translate(5.18 5.18) scale(.62)"),
  refresh + group(F(star), "translate(5.18 5.18) scale(.62)"),
);
put(
  "split-view",
  R(2.25, 3.75, 19.5, 16.5) +
    F(box(12, 3.75, 9.75, 16.5)) +
    S("M5.25 8.25h3.75M5.25 11.25h3.75M5.25 14.25h2.25"),
);
put("square-root", S("M2.25 12.75l4.5 6L14.25 3.75h7.5"));
put("stackoverflow", stackoverflow);
put("step-active", F(circ(12, 12, 9)));
put("step-default", C(12, 12, 9));
const tick = "M6.75 12l3.5 3.5 7-7";
const tickHole = "M5.7 12l1.05-1.05 3.5 3.5 6-6 1.05 1.05-7.05 7.05Z";
put("success-circle", C(12, 12, 9) + S(tick), F(circ(12, 12, 9) + tickHole));
put("step-success", F(circ(12, 12, 9) + tickHole));
const scope = S(
  "M3.75 3v5.25a4.5 4.5 0 0 0 9 0V3M3.75 5.25H6M12.75 5.25h-2.25M8.25 12.75v3a4.875 4.5 0 0 0 9.75 0v-2.25",
);
put("stethoscope", scope + C(18, 10.5, 3), scope + F(circ(18, 10.5, 3)));
put("stop", R(4.5, 4.5, 15, 15), F(box(4.5, 4.5, 15, 15)));
const storage =
  R(2.25, 3.75, 19.5, 4.5) + R(3.75, 8.25, 16.5, 12) + S("M8.25 12.75h7.5");
put(
  "storage",
  storage,
  F(box(2.25, 3.75, 19.5, 4.5)) +
    F(box(3.75, 9.75, 16.5, 10.5) + box(8.25, 12, 7.5, 1.5)),
);
const awning =
  "M5.25 3.75h13.5l3 6Q18.75 12.75 15.75 9.75Q12 12.75 8.25 9.75Q5.25 12.75 2.25 9.75Z";
put(
  "storefront",
  S(awning) +
    S("M3.75 12.75v7.5h16.5v-7.5M1.5 20.25h21") +
    S(box(6.75, 14.25, 4.5, 3), 0.9) +
    S("M14.25 20.25v-6h3v6"),
  F(awning) +
    // This wall opening is a .75px normal offset of the scalloped awning.
    F(
      "M3.75 12.10145Q4.4898 12.375 5.25 12.375Q6.83071 12.375 8.32318 11.1923Q10.13231 12.375 12 12.375Q13.86769 12.375 15.67682 11.1923Q17.16929 12.375 18.75 12.375Q19.5102 12.375 20.25 12.10145V20.25H17.625V14.25H13.875V20.25H3.75ZM6.375 14.25V17.25H11.625V14.25Z",
    ) +
    L(1.5, 20.25, 22.5, 20.25),
);
put(
  "string-number",
  S("M2.25 3.75h19.5M2.25 20.25h19.5") +
    textLabel("123", 12, 8.25, 7.35, { align: "center" }),
);
put(
  "string-text",
  S("M2.25 3.75h19.5M2.25 20.25h19.5") +
    textLabel("abc", 12, 8.25, 7.35, { align: "center" }),
);
const sigma =
  "M3.75 3H20.25v4.5H18V5.25H7.5L13.5 12 7.5 18.75H18V16.5h2.25V21H3.75v-2.25L9.75 12 3.75 5.25Z";
put("sum", S("M20.25 7.5V3.75H4.5L11.25 12 4.5 20.25H20.25v-3.75"), F(sigma));
put(
  "summarize",
  S(
    "M3.75 3v13.5Q3.75 18.75 6 18.75h15M16.875 14.625l4.125 4.125-4.125 4.125M8.25 5.25h12M8.25 9.75h12M8.25 14.25h6",
  ),
);
put(
  "swap",
  S(
    "M2.25 6.75h18m-4.5-4.5 4.5 4.5-4.5 4.5M21.75 17.25h-18m4.5-4.5-4.5 4.5 4.5 4.5",
  ),
);
put("symphony", symphony);
put(
  "sync",
  S(
    `M3 12A9 9 0 0 1 ${refreshTipX} ${refreshTipY}M${refreshTipX - refreshHead} ${refreshTipY}H${refreshTipX}V${refreshTipY - refreshHead}M21 12A9 9 0 0 1 ${24 - refreshTipX} ${24 - refreshTipY}M${24 - refreshTipX + refreshHead} ${24 - refreshTipY}H${24 - refreshTipX}V${24 - refreshTipY + refreshHead}`,
  ),
);
const tag = "M2.25 13.5L13.5 2.25h8.25v8.25L10.5 21.75Z";
put(
  "tag",
  S(tag) + S(circ(17.25, 6.75, 1.5), 1.05),
  F(tag + circ(17.25, 6.75, 1.5)),
);
// The fixed cutout extends 1.875 construction units from the X centerlines.
// Straight offsets are 1.875 / sqrt(2); .75-radius arcs shape the buffers
// around its square terminals. The circular eyelet stays exact.
put(
  "tag-clear",
  S(
    "M17.450825 14.799175L21.75 10.5V2.25H13.5L2.25 13.5L10.5 21.75L14.799175 17.450825",
  ) +
    S(circ(17.25, 6.75, 1.5), 1.05) +
    S("M15 15l7 7M22 15l-7 7"),
  F(
    "M2.25 13.5L13.5 2.25H21.75V10.5L17.450825 14.799175L16.325825 13.674175A.75 .75 0 0 0 15.265165 13.674175L13.674175 15.265165A.75 .75 0 0 0 13.674175 16.325825L14.799175 17.450825L10.5 21.75Z" +
      circ(17.25, 6.75, 1.5),
  ) + S("M15 15l7 7M22 15l-7 7"),
);
const owl = "M3 3.75L9 6h6l6-2.25-3 6.75 3 7.5-9 4.5-9-4.5 3-7.5Z";
// Counters follow the outline beak and cheek curves with a 1.05-unit stroke.
const owlFeatureCounters =
  "M10.8712 14.6288 12 15.7575 13.1288 14.6288 13.8712 15.3712 12.3712 16.8712Q12.3347 16.9078 12.2917 16.9365Q12.2487 16.9652 12.2009 16.985Q12.1531 17.0048 12.1024 17.0149Q12.0517 17.025 12 17.025Q11.9483 17.025 11.8976 17.0149Q11.8469 17.0048 11.7991 16.985Q11.7513 16.9652 11.7083 16.9365Q11.6653 16.9078 11.6288 16.8712L10.1288 15.3712ZM4.4137 15.9821Q8.9419 15.2274 12 20.6318Q15.0581 15.2274 19.5863 15.9821L19.4137 17.0179Q15.2962 16.3316 12.4696 21.9848Q12.3913 22.1413 12.2348 22.2196Q12.1885 22.2427 12.1387 22.2564Q12.0888 22.27 12.0372 22.2737Q11.9856 22.2773 11.9343 22.2709Q11.883 22.2644 11.834 22.2481Q11.7849 22.2317 11.74 22.2061Q11.6951 22.1805 11.656 22.1466Q11.617 22.1127 11.5853 22.0719Q11.5536 22.031 11.5304 21.9848Q8.7038 16.3316 4.5863 17.0179Z";
put(
  "tails",
  S(owl) +
    S(circ(9.25, 11.5, 1.2), 0.9) +
    S(circ(14.75, 11.5, 1.2), 0.9) +
    S(
      "M4.5 16.5Q9 15.75 12 21.75Q15 15.75 19.5 16.5M10.5 15l1.5 1.5 1.5-1.5",
      1.05,
    ),
  F(owl + circ(9.25, 11.5, 1.2) + circ(14.75, 11.5, 1.2) + owlFeatureCounters),
);
put("target", C(12, 12, 7.5) + S("M12 1.5v6M12 16.5v6M1.5 12h6M16.5 12h6"));
put(
  "tear-out",
  S("M9.75 3.75h-6v16.5h16.5v-6M12.75 2.25h9v9M10.5 13.5 21.75 2.25"),
);
for (const [n, segments] of [
  [
    "text-align-center",
    [
      [6, 18],
      [3, 21],
      [6, 18],
    ],
  ],
  [
    "text-align-left",
    [
      [3, 21],
      [3, 16.5],
      [3, 18.75],
    ],
  ],
  [
    "text-align-right",
    [
      [3, 21],
      [7.5, 21],
      [5.25, 21],
    ],
  ],
  [
    "text-align-justify",
    [
      [3, 21],
      [3, 21],
      [3, 21],
    ],
  ],
])
  put(
    n,
    segments
      .map(([a, b], i) => L(a, 5.25 + i * 6.75, b, 5.25 + i * 6.75))
      .join(""),
  );
put(
  "text-bold",
  textLabel("B", 12, 3.75, 16.5, { align: "center", bold: true }),
);
put(
  "text-color",
  textLabel("A", 12, 3, 14.25, { align: "center" }) + F(box(3, 20.25, 18, 1.5)),
);
// A broad marker with a flat chisel nib, rather than a pointed pencil.
put(
  "text-highlight",
  S("M6.75 13.5L16.5 3.75L20.25 7.5L10.5 17.25Z") +
    F("M6.75 13.5L10.5 17.25L8.25 19.5H3.75V18Z") +
    F(box(2.25, 21, 19.5, 1.5)),
);
put("text-italics", italicLetter(12, 3.75));
put(
  "text-underline",
  textLabel("U", 12, 3, 14.25, { align: "center" }) + S("M3.75 21h16.5"),
);
put(
  "text-strikethrough",
  textLabel("S", 12, 3.75, 16.5, { align: "center" }) + S("M2.25 12h19.5"),
);
put(
  "text-unordered-list",
  [5.25, 12, 18.75]
    .map((y) => dot(3.75, y, 1.1) + L(8.25, y, 21.75, y))
    .join(""),
);
put(
  "text-ordered-list",
  [0, 1, 2]
    .map(
      (i) =>
        textLabel(String(i + 1), 3.75, 2.8 + i * 6.75, 4.9, {
          align: "center",
        }) + L(8.25, 5.25 + i * 6.75, 21.75, 5.25 + i * 6.75),
    )
    .join(""),
);
const thumb =
  "M8.25 20.25V9.75L12 3h2.25v6h5.25Q21.75 9 21.75 11.25L19.5 20.25Z";
const thumbO = R(2.25, 9.75, 3, 10.5) + S(thumb);
const thumbF = F(box(2.25, 9.75, 3, 10.5)) + F(thumb);
put("thumbs-up", thumbO, thumbF);
put(
  "thumbs-down",
  group(thumbO, "rotate(180 12 12)"),
  group(thumbF, "rotate(180 12 12)"),
);
const handle = S("M8.25 11.25V6a3.75 3.75 0 0 1 7.5 0v5.25");
put(
  "tote",
  R(3.75, 8.25, 16.5, 12) + handle,
  F(
    box(3.75, 8.25, 16.5, 12) +
      box(7.5, 9.75, 1.5, 1.5) +
      box(15, 9.75, 1.5, 1.5),
  ) + S("M8.25 8.25V6a3.75 3.75 0 0 1 7.5 0v2.25"),
);
// Both cases have two wheels, mirrored around their own body centers.
const caseDetails = S(
  "M4.875 6.75v-3h4.5v3M16.875 11.25v-3h3.75v3M3.75 18.75v2.25M10.5 18.75v2.25M16.5 20.25v2.25M21 20.25v2.25",
);
put(
  "travel",
  R(2.25, 6.75, 9.75, 12, 1) + R(15, 11.25, 7.5, 9, 1) + caseDetails,
  F(box(2.25, 6.75, 9.75, 12, 1)) + F(box(15, 11.25, 7.5, 9, 1)) + caseDetails,
);
const branch = S("M12 8.25v4.5M5.25 15.75v-3h13.5v3");
put(
  "tree",
  branch + R(9, 2.25, 6, 6) + R(2.25, 15.75, 6, 6) + R(15.75, 15.75, 6, 6),
  branch +
    F(box(9, 2.25, 6, 6) + box(2.25, 15.75, 6, 6) + box(15.75, 15.75, 6, 6)),
);
for (const [n, rot] of [
  ["triangle-down", 0],
  ["triangle-left", 90],
  ["triangle-up", 180],
  ["triangle-right", 270],
])
  put(n, group(F("M4.5 7.5h15L12 16.5Z"), `rotate(${rot} 12 12)`));
put("triangle-right-down", F("M6 18h12V6Z"));
const handles = [
  box(2.25, 2.25, 3, 3),
  box(18.75, 2.25, 3, 3),
  box(2.25, 18.75, 3, 3),
  box(18.75, 18.75, 3, 3),
];
const typeLines =
  S("M5.25 3.75h13.5M3.75 5.25v13.5M20.25 5.25v13.5M5.25 20.25h13.5") +
  textLabel("T", 12, 6.75, 10.5, { align: "center" });
put(
  "type",
  typeLines + handles.map((p) => S(p)).join(""),
  typeLines + F(handles.join("")),
);
put("undo", S("M3.75 3.75v6h6M3.75 9.75a8.25 8.25 0 1 1 7.5 11.25"));
const ungroupLines = S("M15 3.75h5.25V9M3.75 15v5.25H9");
put(
  "ungroup",
  R(2.25, 2.25, 8.25, 8.25) + R(13.5, 13.5, 8.25, 8.25) + ungroupLines,
  F(box(2.25, 2.25, 8.25, 8.25) + box(13.5, 13.5, 8.25, 8.25)) + ungroupLines,
);
const accessPerson =
  "M10.5 10.5L6 9.75 5.7 11.1 10.5 12 9 18h1.5L12 14.25 13.5 18H15l-1.5-6 4.8-.9-.3-1.35-4.5.75Z";
put(
  "universal-access",
  C(12, 12, 9.75) + F(circ(12, 6.75, 1.35) + accessPerson),
  F(circ(12, 12, 9.75) + circ(12, 6.75, 1.35) + accessPerson),
);
put(
  "unlinked",
  S(
    "M9 5.25l2.25-2.25a4.5 4.5 0 0 1 6.36 6.36l-2.25 2.25M15 18.75l-2.25 2.25a4.5 4.5 0 0 1-6.36-6.36l2.25-2.25M2.25 8.25h3M5.25 2.25v3M18.75 18.75v3M18.75 15.75h3",
  ),
);
const shackle = S("M6.75 10.5v-3a5.25 5.25 0 0 1 10.1-2");
const keyhole = "M11.25 16.049A1.5 1.5 0 1 1 12.75 16.049V18.75H11.25Z";
put(
  "unlocked",
  shackle + R(3.75, 10.5, 16.5, 10.5, 0.6) + F(keyhole),
  shackle + F(box(3.75, 10.5, 16.5, 10.5, 0.6) + keyhole),
);
put("upload", S("M12 17.25V2.25m-6 6 6-6 6 6M3.75 18.75v3h16.5v-3"));
for (const [n, count, start] of [
  ["urgency-low", 1, 10.5],
  ["urgency-medium", 2, 8.25],
  ["urgency-high", 3, 5.25],
])
  put(
    n,
    Array.from({ length: count }, (_, i) =>
      S(`M3  ${start + i * 5.25 + 5.25}l9-5.25 9 5.25`),
    ).join(""),
  );
put(
  "urgency-critical",
  F("M3 8.25L12 3l9 5.25v4.5l-9-5.25-9 5.25Z") + S("M3 19.5l9-5.25 9 5.25"),
);
put("urgency-none", S("M3.75 8.25h16.5M3.75 15.75h16.5"));
put("urgency-ontime", S("M2.25 12 12 5.25 21.75 12 12 18.75Z"));
const head = circ(12, 7.2, 3.3);
const shoulders = "M3.75 21V18Q3.75 13.5 12 13.5Q20.25 13.5 20.25 18V21Z";
put("user", S(head + shoulders), F(head) + F(shoulders));
const shield = "M12 2.25L21 5.25Q21 17.25 12 21.75Q3 17.25 3 5.25Z";
const tinyHead = circ(12, 8.5, 2.1);
const tinyBody = "M7.5 17.25Q7.5 13.5 12 13.5Q16.5 13.5 16.5 17.25L12 20.25Z";
put(
  "user-admin",
  S(shield) +
    S(tinyHead, 1.2) +
    S("M7.5 17.25Q7.5 13.5 12 13.5Q16.5 13.5 16.5 17.25", 1.2),
  F(shield + tinyHead + tinyBody),
);
put(
  "user-badge",
  F(
    circ(12, 12, 9.75) +
      circ(12, 8.25, 3) +
      "M5.25 18.75Q5.25 13.5 12 13.5Q18.75 13.5 18.75 18.75Q12 24 5.25 18.75Z",
  ),
);
// The rear person's cutout follows the foreground shoulder's true normal offset.
const userGroupFront = "M1.5 21V18Q1.5 13.5 8.25 13.5Q15 13.5 15 18V21Z";
const userGroupRearHead = circ(18, 8, 2.75);
const userGroupRearOutline =
  "M17.048008 14.297086Q17.495752 14.25 18 14.25Q22.5 14.25 22.5 18L22.5 21L18 21";
const userGroupRearSolid =
  "M18 21V18C18 17.4375 17.947311 16.873798 17.827938 16.316725C17.708567 15.759651 17.52129 15.209373 17.261408 14.689609C17.194866 14.556525 17.123562 14.425562 17.047775 14.297111Q17.495619 14.25 18 14.25Q22.5 14.25 22.5 18V21H18Z";
put(
  "user-group",
  S(circ(8.25, 7.2, 3.3)) +
    S(userGroupFront) +
    S(userGroupRearHead) +
    S(userGroupRearOutline),
  F(circ(8.25, 7.2, 3.3)) +
    F(userGroupFront) +
    F(userGroupRearHead) +
    F(userGroupRearSolid),
);
put(
  "user-search",
  S(circ(9, 7.2, 3.3)) +
    S(
      "M2.25 21L2.25 18Q2.25 13.5 9 13.5Q10.000071 13.5 10.851973 13.598779M13.007359 21L2.25 21",
    ) +
    C(17.25, 15.75, 3.75) +
    L(20, 18.5, 23, 21.5),
);
// Three open tines join a curved fork base; the knife shares its cap and baseline.
const utensilFork =
  "M4.5 3V8.25Q4.5 10.5 7.5 10.5Q10.5 10.5 10.5 8.25V3M7.5 3V21";
const utensilKnife = "M19.5 3.75C17.625 3.75 15.75 6 15.75 9V12.75H19.5Z";
const utensilHandle = "M19.5 12.75V21";
const utensilOutline = S(utensilFork) + S(utensilKnife) + S(utensilHandle);
put(
  "utensils",
  utensilOutline,
  F("M4.5 8.25Q4.5 10.5 7.5 10.5Q10.5 10.5 10.5 8.25Z") +
    F(utensilKnife) +
    utensilOutline,
);
const videoO =
  R(2.25, 5.25, 13.5, 13.5, 0.75) + S("M15.75 9 21.75 6.75v10.5L15.75 15Z");
const videoF = F(
  `${box(2.25, 5.25, 13.5, 13.5, 0.75)}M17.25 9l4.5-2.25v10.5L17.25 15Z`,
);
put("video", videoO, videoF);
put(
  "video-disabled",
  S(
    "M9.492641 5.25L15 5.25Q15.75 5.25 15.75 6L15.75 11.507359M14.507359 18.75L3 18.75Q2.25 18.75 2.25 18L2.25 6.492641",
  ) +
    S(
      "M15.75 9L21.75 6.75L21.75 17.25L21.338225 17.095584M15.75 11.507359L15.75 9",
    ) +
    slash(),
);
const eye = "M2.25 12Q12-3.75 21.75 12Q12 27.75 2.25 12Z";
put(
  "visible",
  S(eye) + C(12, 12, 3),
  F(eye + circ(12, 12, 3.75)) + dot(12, 12, 2.25),
);
const speaker = F("M2.25 9h4.5L12.75 3.75v16.5L6.75 15h-4.5Z");
put("volume-down", speaker + S("M16.5 8.25q3.75 3.75 0 7.5"));
put(
  "volume-up",
  speaker + S("M16.5 8.25q3.75 3.75 0 7.5M19.5 5.25q6.75 6.75 0 13.5"),
);
put("volume-off", speaker + S("M16.5 8.25 22.5 15.75M22.5 8.25 16.5 15.75"));
const warning = "M12 3L21.75 21H2.25Z";
put(
  "warning",
  S(warning) + S("M12 8.25v6") + dot(12, 17.25, 1),
  F(warning + box(11.25, 8.25, 1.5, 6) + circ(12, 17.25, 1)),
);
const straps = S("M8.25 6.75v-4.5h7.5v4.5M8.25 17.25v4.5h7.5v-4.5");
put(
  "watch",
  straps + R(5.25, 6.75, 13.5, 10.5, 1.5) + S("M12 9V12L14 13.33333"),
  F(box(8.25, 2.25, 7.5, 4.5) + box(8.25, 17.25, 7.5, 4.5)) +
    F(
      `${box(5.25, 6.75, 13.5, 10.5, 1.5)}M12.75 9V11.59861L14.41602 12.70929L13.58398 13.95737L11.25 12.40139V9Z`,
    ),
);
put("waveform", S("M3 9v6M7.5 5.25v13.5M12 1.5v21M16.5 6.75v10.5M21 9.75v4.5"));
const weightBody = "M5.25 9.75h13.5l3 12H2.25Z";
put("weight", C(12, 6, 3.75) + S(weightBody), C(12, 6, 3.75) + F(weightBody));
const wifi =
  S(
    "M2.25 7.5Q12-1.5 21.75 7.5M5.25 11.25Q12 4.5 18.75 11.25M8.25 15Q12 11.25 15.75 15",
  ) + dot(12, 19.5, 1.35);
put("wifi", wifi);
// The normal Wi-Fi curves are cut parallel to the slash, leaving a visible
// corridor at the authored width without shifting the three signal arcs.
put(
  "wifi-disabled",
  S(
    "M2.25 7.5Q2.56269 7.21136 2.87538 6.94124M7.87237 3.8065Q14.81118 1.09494 21.75 7.5M5.25 11.25Q5.75222 10.74778 6.25443 10.3203M11.94112 7.87526Q15.34556 7.84556 18.75 11.25M8.25 15Q8.99505 14.25495 9.74009 13.80596",
  ) +
    dot(12, 19.5, 1.35) +
    slash(),
);
const womanHead = circ(12, 4.5, 2.25);
const dress = "M10.5 9.75h3L16 17.25H8Z";
put(
  "woman",
  S(womanHead) + S(dress) + S("M9 17.25v4.5h6v-4.5M12 17.25v4.5"),
  F(womanHead) + F(`${dress}M9 17.25h6v4.5h-2.25v-4.5h-1.5v4.5H9Z`),
);
const treeCrown =
  "M6.75 18.75a5.25 5.25 0 0 1-1.5-10.25a6.75 6.75 0 0 1 13.5 0a5.25 5.25 0 0 1-1.5 10.25Z";
put(
  "woodland",
  S(treeCrown) + S("M12 6.75v15.75M12 12.75l4.5-3M12 16.5l-3-3"),
  F(
    treeCrown +
      "M11.25 6.75h1.5V11.3l3.25-2.2.85 1.2-4.1 2.8v7.15h-1.5V16.8l-3.45-3.2 1.05-1.1 2.4 2.2Z",
  ) + L(12, 18.75, 12, 22.5),
);
const flow = S(
  "M7.5 4.5h10.5a4.5 4.5 0 0 1 0 9h-3M9 13.5H7.5a3.25 3.25 0 0 0 0 6.5H21m-3-3L21 20l-3 3",
);
put(
  "workflow",
  flow + C(4.5, 4.5, 3) + C(12, 13.5, 3),
  flow + F(circ(4.5, 4.5, 3)) + F(circ(12, 13.5, 3)),
);
export default icons;
