import { softenedStroke as S, softenedFill as F } from "./contour-profiles.mjs";
import { softenedRect as R, softenedFrame as SF } from "./contour-profiles.mjs";
import { arrowRoot } from "./internal-arrow-junctions.mjs";
import { concavePolygon, circularHeadJoins, cubicHeadJoins } from "./cd-junctions.mjs";
import { stackoverflow, symphony } from "./brands.mjs";
import { weldedCross } from "./cross-marks.mjs";
import {
  angledJunction,
  radialCircleJunction,
  circleOnBaseJunction,
} from "./structural-junctions.mjs";
import { enclosedTick, enclosedWarning } from "./enclosed-marks.mjs";
import { circularCrossJunction } from "./junctions.mjs";
import { lockKeyhole } from "./lock-marks.mjs";
import { withSharedMark } from "./mark-composition.mjs";
import { box, C, circ, dot, group, italicLetter, L, slash, textLabel } from "./primitives.mjs";

const icons = {};
const put = (n, o, s) => {
  icons[n] = [o, s];
};
const down = S("M18 3.75V20.25M14.25 16.5L18 20.25L21.75 16.5") + arrowRoot(18, 20.25, [0, -1], 1.45);
const both = S(
  "M18 3.75V9.75M14.25 7.5L18 3.75L21.75 7.5M18 20.25V14.25M14.25 16.5L18 20.25L21.75 16.5",
) + arrowRoot(18, 3.75, [0, 1], 1.45) + arrowRoot(18, 20.25, [0, -1], 1.45);
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
put(
  "success-circle",
  withSharedMark(C(12, 12, 9), enclosedTick),
  withSharedMark(F(circ(12, 12, 9)), enclosedTick, true),
);
put("step-success", withSharedMark(F(circ(12, 12, 9)), enclosedTick, true));
const scope =
  S(
    "M3.75 3v5.25a4.5 4.5 0 0 0 9 0V3M3.75 5.25H6M12.75 5.25h-2.25M8.25 12.75v3a4.875 4.5 0 0 0 9.75 0v-2.25",
  ) +
  radialCircleJunction(8.25, 8.25, 4.5, 1.65, 90) +
  radialCircleJunction(18, 10.5, 3, 1.5, 90) +
  circularCrossJunction(3.75, 5.25, 1.5, undefined, [
    [1, -1],
    [1, 1],
  ]) +
  circularCrossJunction(12.75, 5.25, 1.5, undefined, [
    [-1, -1],
    [-1, 1],
  ]);
// Filling the chestpiece retains its original rim and the complete tube.
// Their equal painted extents keep the two variants on one final frame.
put(
  "stethoscope",
  scope + C(18, 10.5, 3),
  scope + F(circ(18, 10.5, 3)) + C(18, 10.5, 3),
);
put(
  "stop",
  R(4.5, 4.5, 15, 15),
  F(box(4.5, 4.5, 15, 15)) + R(4.5, 4.5, 15, 15),
);
const storageFrame = R(2.25, 3.75, 19.5, 4.5) + R(3.75, 8.25, 16.5, 12) +
  [3.75, 20.25].map((x) => circularCrossJunction(x, 8.25, 1.35, undefined,
    [[-1, 1], [1, 1]])).join("");
put(
  "storage",
  storageFrame + S("M8.25 12.75h7.5"),
  F(box(2.25, 3.75, 19.5, 4.5)) +
    F(box(3.75, 8.25, 16.5, 12) + box(8.25, 12, 7.5, 1.5)) + storageFrame,
);
const awning =
  "M5.25 3.75h13.5l3 6Q18.75 12.75 15.75 9.75Q12 12.75 8.25 9.75Q5.25 12.75 2.25 9.75Z";
// The canopy's painted rim determines the common final frame. Offset its
// actual quadratic scallops, including their valleys, rather than dropping
// that rim or translating a similar-looking wall curve. At final W=4/3 the
// opening is .65 units; it remains .5667 at the heavy1.5 review width.
const storefrontScale = (1.05314 * 2) / 3;
const storefrontClearance = (0.65 + 2 / 3) / storefrontScale;
const storefrontHalfRim = 7 / 12 / storefrontScale;
const canopyLowerOffset = (x) =>
  Math.max(
    ...[
      [2.25, 6],
      [8.25, 7.5],
      [15.75, 6],
    ].map(([left, span]) => {
      let lo = Math.max(0, (x - storefrontClearance - left) / span);
      let hi = Math.min(1, (x + storefrontClearance - left) / span);
      if (lo > hi) return -Infinity;
      const ordinate = (t) =>
        9.75 +
        6 * t * (1 - t) +
        Math.sqrt(
          Math.max(0, storefrontClearance ** 2 - (x - left - span * t) ** 2),
        );
      // A quadratic scallop plus a circle envelope is concave, so this solve
      // finds its exact lower offset at x. The maximum retains the lower union
      // where adjacent offset scallops overlap at an inward valley.
      for (let i = 0; i < 45; i++) {
        const a = (2 * lo + hi) / 3,
          b = (lo + 2 * hi) / 3;
        if (ordinate(a) < ordinate(b)) lo = a;
        else hi = b;
      }
      return ordinate((lo + hi) / 2);
    }),
  );
const storefrontWallCap = canopyLowerOffset(3.75 + storefrontHalfRim);
const storefrontWallLeft = 3.75 - storefrontHalfRim;
const storefrontWallRight = 20.25 + storefrontHalfRim;
// Adaptive linear segments approximate the normal offset to .002 source
// units (under .0015 final units). Split at half-unit intervals so a scallop
// valley cannot hide between the midpoint and endpoints of a wide segment.
const canopyOffsetPoints = [
  [storefrontWallLeft, canopyLowerOffset(storefrontWallLeft)],
];
const appendCanopyOffset = (left, right, depth = 0) => {
  const middle = [
    (left[0] + right[0]) / 2,
    canopyLowerOffset((left[0] + right[0]) / 2),
  ];
  if (depth < 12 && Math.abs(middle[1] - (left[1] + right[1]) / 2) > 0.002) {
    appendCanopyOffset(left, middle, depth + 1);
    appendCanopyOffset(middle, right, depth + 1);
  } else canopyOffsetPoints.push(right);
};
for (let x = storefrontWallLeft; x < storefrontWallRight; x += 0.5) {
  const next = Math.min(x + 0.5, storefrontWallRight);
  appendCanopyOffset(
    [x, canopyLowerOffset(x)],
    [next, canopyLowerOffset(next)],
  );
}
const storefrontWall =
  canopyOffsetPoints
    .map(
      ([x, y], index) =>
        `${index ? "L" : "M"}${Number(x.toFixed(6))} ${Number(y.toFixed(6))}`,
    )
    .join("") +
  `V20.25H17.625V14.25H13.875V20.25H${storefrontWallLeft}Z` +
  "M6.375 14.25V17.25H11.625V14.25Z";
const storefrontGroundJoins = [3.75, 20.25]
  .map((x) =>
    circularCrossJunction(x, 20.25, 1.65, undefined, [
      [-1, -1],
      [1, -1],
    ]),
  )
  .join("");
put(
  "storefront",
  S(awning) +
    S(
      `M3.75 ${storefrontWallCap}V20.25H20.25V${storefrontWallCap}M1.5 20.25h21`,
    ) +
    S(box(6.75, 14.25, 4.5, 3), 0.9) +
    S("M14.25 20.25v-6h3v6") +
    storefrontGroundJoins,
  F(awning) +
    S(awning) +
    F(storefrontWall) +
    L(1.5, 20.25, 22.5, 20.25) +
    storefrontGroundJoins,
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
// Offset the retained 6-by-6.75 diagonals by the bars' 2.25-unit thickness.
// A horizontal 3.75-unit offset made their perpendicular weight 25% heavier.
const sigmaOffsetX = (2.25 * Math.hypot(6, 6.75)) / 6.75;
const sigma = `M3.75 3H20.25v4.5H18V5.25H${3.75 + sigmaOffsetX}L${9.75 + sigmaOffsetX} 12 ${3.75 + sigmaOffsetX} 18.75H18V16.5h2.25V21H3.75v-2.25L9.75 12 3.75 5.25Z`;
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
  SF(tag) + S(circ(17.25, 6.75, 1.5), 1.05),
  F(tag + circ(17.25, 6.75, 1.5)) + SF(tag),
);
// The fixed cutout extends 1.875 construction units from the X centerlines.
// The cap pocket offsets its complete painted corners at final W = 7/6,
// balancing the 1 and 4/3 theme widths in the shared Tag family frame.
// The .702093-unit final scale makes a .830849-unit construction half-width
// correspond to W = 7/6; its 1.044151-unit radius completes the 1.875 buffer.
// Its straight envelope and circular eyelet stay exact. Retaining the same
// open perimeter in the solid keeps its eyelet and clearing X on one frame;
// the curved clearance edge itself receives no extra stroke.
const tagClearPerimeter = S(
  "M17.450825 14.799175L21.75 10.5V2.25H13.5L2.25 13.5L10.5 21.75L14.799175 17.450825",
);
put(
  "tag-clear",
  tagClearPerimeter +
    S(circ(17.25, 6.75, 1.5), 1.05) +
    weldedCross(18.5, 18.5, 3.5, 3.5, 1.3),
  F(
    "M2.25 13.5L13.5 2.25H21.75V10.5L17.450825 14.799175L16.325825 13.674175A1.044151 1.044151 0 0 0 14.849172 13.674175L13.674175 14.849172A1.044151 1.044151 0 0 0 13.674175 16.325825L14.799175 17.450825L10.5 21.75Z" +
      circ(17.25, 6.75, 1.5),
  ) +
    tagClearPerimeter +
    weldedCross(18.5, 18.5, 3.5, 3.5, 1.3),
);
// Tails represents the catalogue's fox. Retain the earlier curved forehead,
// hollow ears and pointed muzzle, with small eyes instead of an owl's eye rings.
const fox =
  "M3 3.75Q7 3.9 10.5 6H13.5Q17 3.9 21 3.75L18.75 9L21 16.5L12 22.5L3 16.5L5.25 9Z";
const foxEars = "M5.75 6L8.5 7.5H6.5ZM18.25 6L15.5 7.5H17.5Z";
const foxEyes = circ(8, 11.25, 1) + circ(16, 11.25, 1);
const foxCheeks = "M3.75 14.25Q8.5 13.75 12 18Q15.5 13.75 20.25 14.25";
const foxMuzzle = `${foxCheeks}L12 22.5Z`;
const foxNose = "M10.5 18H13.5L12 20.25Z";
// Shared outer and cheek strokes preserve the pair's fit and feature anchors.
const foxLinework = S(fox) + S(foxCheeks, 1.05);
put(
  "tails",
  foxLinework + F(foxEars + foxEyes + foxNose),
  F(fox + foxEars + foxEyes + foxMuzzle) + foxLinework + F(foxNose),
);
// Exact circular fillets are tangent to both a cardinal tick and its circle.
// The inside tangent is shorter than the tick, retaining a flat inner end.
const targetRadius = 7.5;
const targetReach = 1.8;
const targetRoot = [-1, 1]
  .flatMap((side) => {
    const distance = targetRadius + side * targetReach;
    const x = Math.sqrt(
      targetRadius ** 2 + side * 2 * targetRadius * targetReach,
    );
    return [-1, 1].map(
      (vertical) =>
        `M${12 + x} 12A${targetReach} ${targetReach} 0 0 ${side * vertical === 1 ? 0 : 1} ${12 + (targetRadius * x) / distance} ${12 + (vertical * targetRadius * targetReach) / distance}`,
    );
  })
  .join("");
put(
  "target",
  C(12, 12, targetRadius) +
    S("M12 1.5v6M12 16.5v6M1.5 12h6M16.5 12h6") +
    [0, 90, 180, 270]
      .map((angle) => group(S(targetRoot), `rotate(${angle} 12 12)`))
      .join(""),
);
put(
  "tear-out",
  SF("M9.75 3.75h-6v16.5h16.5v-6") + S("M12.75 2.25h9v9M10.5 13.5 21.75 2.25"),
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
// An exact circular thumb-web fillet retains visible inner curvature after
// the heaviest supported outline stroke; the tip and separate cuff stay fixed.
const thumb =
  "M8.25 20.25V9.75L12 3h2.25V7.4A1.6 1.6 0 0 0 15.85 9H19.5Q21.75 9 21.75 11.25L19.5 20.25Z";
const thumbO = R(2.25, 9.75, 3, 10.5) + S(thumb);
const thumbF = F(box(2.25, 9.75, 3, 10.5)) + F(thumb);
put("thumbs-up", thumbO, thumbF);
put(
  "thumbs-down",
  group(thumbO, "rotate(180 12 12)"),
  group(thumbF, "rotate(180 12 12)"),
);
const handle = S("M8.25 11.25V6a3.75 3.75 0 0 1 7.5 0v5.25");
const toteHandleJoins = [8.25, 15.75]
  .map((x) =>
    circularCrossJunction(x, 8.25, 1.65, undefined, [
      [-1, -1],
      [1, -1],
    ]),
  )
  .join("");
const toteInnerJoins = [8.25, 15.75]
  .map((x) =>
    circularCrossJunction(x, 8.25, 1.65, undefined, [
      [-1, 1],
      [1, 1],
    ]),
  )
  .join("");
put(
  "tote",
  R(3.75, 8.25, 16.5, 12) + handle + toteHandleJoins + toteInnerJoins,
  F(
    box(3.75, 8.25, 16.5, 12) +
      box(7.5, 9.75, 1.5, 1.5) +
      box(15, 9.75, 1.5, 1.5),
  ) +
    R(3.75, 8.25, 16.5, 12) +
    S("M8.25 8.25V6a3.75 3.75 0 0 1 7.5 0v2.25") +
    toteHandleJoins,
);
// Both cases have two wheels, mirrored around their own body centers.
// Crisp case corners leave a real straight rim for the compact handle and
// wheel fillets without moving their anchors or narrowing the handle opening.
const caseDetails =
  S(
    "M4.875 6.75v-3h4.5v3M16.875 11.25v-3h3.75v3M3.75 18.75v2.25M10.5 18.75v2.25M16.5 20.25v2.25M21 20.25v2.25",
  ) +
  [
    [4.875, 6.75],
    [9.375, 6.75],
    [16.875, 11.25],
    [20.625, 11.25],
  ]
    .map(([x, y]) =>
      circularCrossJunction(x, y, 1.35, undefined, [
        [-1, -1],
        [1, -1],
      ]),
    )
    .join("") +
  [
    [3.75, 18.75],
    [10.5, 18.75],
    [16.5, 20.25],
    [21, 20.25],
  ]
    .map(([x, y]) =>
      circularCrossJunction(x, y, 1.25, undefined, [
        [-1, 1],
        [1, 1],
      ]),
    )
    .join("");
put(
  "travel",
  R(2.25, 6.75, 9.75, 12) + R(15, 11.25, 7.5, 9) + caseDetails,
  F(box(2.25, 6.75, 9.75, 12)) +
    F(box(15, 11.25, 7.5, 9)) +
    R(2.25, 6.75, 9.75, 12) +
    R(15, 11.25, 7.5, 9) +
    caseDetails,
);
// Fillet the central T and the three true node attachments. The box corners
// and elbow exteriors remain square; separate nodes keep their open gaps.
const branch =
  S("M12 8.25v4.5M5.25 15.75v-3h13.5v3") +
  circularCrossJunction(12, 12.75, 1.8, undefined, [
    [-1, -1],
    [1, -1],
  ]) +
  circularCrossJunction(12, 8.25, 1.5, undefined, [
    [-1, 1],
    [1, 1],
  ]) +
  [5.25, 18.75]
    .map((x) =>
      circularCrossJunction(x, 15.75, 1.5, undefined, [
        [-1, -1],
        [1, -1],
      ]),
    )
    .join("");
put(
  "tree",
  branch + R(9, 2.25, 6, 6) + R(2.25, 15.75, 6, 6) + R(15.75, 15.75, 6, 6),
  branch +
    F(box(9, 2.25, 6, 6) + box(2.25, 15.75, 6, 6) + box(15.75, 15.75, 6, 6)) +
    R(9, 2.25, 6, 6) +
    R(2.25, 15.75, 6, 6) +
    R(15.75, 15.75, 6, 6),
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
const typeJoins = [
  [5.25, 3.75, [[1, -1], [1, 1]]], [18.75, 3.75, [[-1, -1], [-1, 1]]],
  [5.25, 20.25, [[1, -1], [1, 1]]], [18.75, 20.25, [[-1, -1], [-1, 1]]],
  [3.75, 5.25, [[-1, 1], [1, 1]]], [20.25, 5.25, [[-1, 1], [1, 1]]],
  [3.75, 18.75, [[-1, -1], [1, -1]]], [20.25, 18.75, [[-1, -1], [1, -1]]],
].map(([x, y, quadrants]) => circularCrossJunction(x, y, 1.3, undefined, quadrants)).join("");
const typeLines =
  typeJoins +
  S("M5.25 3.75h13.5M3.75 5.25v13.5M20.25 5.25v13.5M5.25 20.25h13.5") +
  textLabel("T", 12, 6.75, 10.5, { align: "center" });
put(
  "type",
  typeLines + handles.map((p) => S(p)).join(""),
  typeLines + handles.map((p) => S(p)).join("") + F(handles.join("")),
);
put("undo", S("M3.75 3.75v6h6M3.75 9.75a8.25 8.25 0 1 1 7.5 11.25"));
const ungroupLines = SF("M15 3.75h5.25V9M3.75 15v5.25H9");
put(
  "ungroup",
  R(2.25, 2.25, 8.25, 8.25) + R(13.5, 13.5, 8.25, 8.25) + ungroupLines,
  F(box(2.25, 2.25, 8.25, 8.25) + box(13.5, 13.5, 8.25, 8.25)) +
    R(2.25, 2.25, 8.25, 8.25) +
    R(13.5, 13.5, 8.25, 8.25) +
    ungroupLines,
);
const accessPerson = concavePolygon([
  [10.5, 10.5], [6, 9.75], [5.7, 11.1], [10.5, 12], [9, 18],
  [10.5, 18], [12, 14.25], [13.5, 18], [15, 18], [13.5, 12],
  [18.3, 11.1], [18, 9.75], [13.5, 10.5],
], .45);
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
const shackle =
  S("M6.75 10.5v-3a5.25 5.25 0 0 1 10.1-2") +
  circularCrossJunction(6.75, 10.5, 1.8, undefined, [
    [-1, -1],
    [1, -1],
  ]);
put(
  "unlocked",
  withSharedMark(shackle + R(3.75, 10.5, 16.5, 10.5), lockKeyhole),
  withSharedMark(
    shackle +
      F(box(3.75, 10.5, 16.5, 10.5)) +
      R(3.75, 10.5, 16.5, 10.5),
    lockKeyhole,
    true,
  ),
);
put("upload", S("M12 17.25V2.25m-6 6 6-6 6 6") + SF("M3.75 18.75v3h16.5v-3"));
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
// Fill within the retained rims so the head and shoulders keep one final frame.
put("user", S(head) + SF(shoulders), F(head) + F(shoulders) + S(head) + SF(shoulders));
const shield = "M12 2.25L21 5.25Q21 17.25 12 21.75Q3 17.25 3 5.25Z";
const tinyHead = circ(12, 8.5, 2.1);
const tinyBody = "M9 16.25Q9 13.5 12 13.5Q15 13.5 15 16.25L12 18.25Z";
put(
  "user-admin",
  S(shield) +
    S(tinyHead, 1.2) +
    S("M9 16.25Q9 13.5 12 13.5Q15 13.5 15 16.25", 1.2),
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
// Trim the rear shoulder along its original curve at final W = 7/6 so its
// complete cap corner matches the lower opening beside the foreground person.
const userGroupRearOutline =
  "M17.413352 14.267065Q17.696437 14.25 18 14.25Q22.5 14.25 22.5 18L22.5 21L18 21";
const userGroupRearSolid =
  "M18 21V18C18 17.4375 17.947311 16.873798 17.827938 16.316725C17.708567 15.759651 17.52129 15.209373 17.261408 14.689609C17.194866 14.556525 17.123562 14.425562 17.047775 14.297111Q17.495619 14.25 18 14.25Q22.5 14.25 22.5 18V21H18Z";
put(
  "user-group",
  S(circ(8.25, 7.2, 3.3)) +
    SF(userGroupFront) +
    S(userGroupRearHead) +
    SF(userGroupRearOutline),
  // Preserve both heads and the complete foreground rim. The rear rim
  // stays on its existing open contour so the shoulder clearance remains open.
  F(circ(8.25, 7.2, 3.3)) +
    S(circ(8.25, 7.2, 3.3)) +
    F(userGroupFront) +
    SF(userGroupFront) +
    F(userGroupRearHead) +
    S(userGroupRearHead) +
    F(userGroupRearSolid) +
    SF(userGroupRearOutline),
);
// Calibrate both body caps to the retained lens at final W = 7/6. Keep the
// lower-left perimeter continuous so two perpendicular butt caps cannot split.
put(
  "user-search",
  S(circ(9, 7.2, 3.3)) +
    SF(
      "M11.036614 13.578604Q10.090361 13.5 9 13.5Q2.25 13.5 2.25 18V21H12.572379",
    ) +
    C(17.25, 15.75, 3.75) +
    L(20, 18.5, 23, 21.5) +
    radialCircleJunction(17.25, 15.75, 3.75, 1.65, 45),
);
// Three open tines join a curved fork base; the knife shares its cap and baseline.
const utensilFork =
  "M4.5 3V8.25Q4.5 10.5 7.5 10.5Q10.5 10.5 10.5 8.25V3M7.5 3V21";
const utensilKnife = "M19.5 3.75C17.625 3.75 15.75 6 15.75 9V12.75H19.5Z";
const utensilHandle = "M19.5 12.75V21";
const knifeJoin = circularCrossJunction(19.5, 12.75, 1.6, undefined, [[-1, 1]]);
// Tangent quadratic bridges meet the retained fork bowl at t=.65. The
// control lies on both its endpoint tangent and the middle tine; the bowl
// keeps its original curve and the tine keeps its flat free terminal.
const forkJoins = S(
  "M7.5 8.7Q7.5 10.924038 5.7675 10.224375M7.5 8.7Q7.5 10.924038 9.2325 10.224375M7.5 12.3Q7.5 10.924038 5.7675 10.224375M7.5 12.3Q7.5 10.924038 9.2325 10.224375",
);
const utensilOutline =
  S(utensilFork) + forkJoins + S(utensilKnife) + S(utensilHandle) + knifeJoin;
put(
  "utensils",
  utensilOutline,
  F("M4.5 8.25Q4.5 10.5 7.5 10.5Q10.5 10.5 10.5 8.25Z") +
    F(utensilKnife) +
    utensilOutline,
);
const videoBody = box(2.25, 5.25, 13.5, 13.5);
const videoWedge = "M15.75 9L21.75 6.75v10.5L15.75 15Z";
const videoJoin = (y, sign) =>
  angledJunction(15.75, y, [0, -1], [6, sign * 2.25], 1.35) +
  angledJunction(15.75, y, [0, 1], [6, sign * 2.25], 1.35);
const videoJoins = videoJoin(9, -1) + videoJoin(15, 1);
const videoO = SF(videoBody) + S(videoWedge) + videoJoins;
const videoF = F(videoBody) + F(videoWedge) + videoO;
put("video", videoO, videoF);
// The angled wedge cap needs a different centerline cut from the axial caps;
// match their complete painted clearance at final W = 7/6.
put(
  "video-disabled",
  SF(
    "M9.492641 5.25H15.75V11.507359M14.507359 18.75H2.25V6.492641",
  ) +
    S(
      "M15.75 9L21.75 6.75L21.75 17.25L21.711914 17.235718M15.75 11.507359L15.75 9",
    ) +
    videoJoin(9, -1) +
    slash(),
);
const eye = "M2.25 12Q12-3.75 21.75 12Q12 27.75 2.25 12Z";
put(
  "visible",
  S(eye) + C(12, 12, 3),
  F(eye + circ(12, 12, 3.75)) + dot(12, 12, 2.25),
);
// Keep this speaker and the inner wave shared. The quieter/muted states use
// optical targets matching VolumeUp's final speaker size and left anchor.
const speaker = F("M2.25 9h4.5L12.75 3.75v16.5L6.75 15h-4.5Z");
put("volume-down", speaker + S("M16.5 8.25q3.75 3.75 0 7.5"));
put(
  "volume-up",
  speaker + S("M16.5 8.25q3.75 3.75 0 7.5M19.5 5.25q6.75 6.75 0 13.5"),
);
put("volume-off", speaker + weldedCross(19.5, 12, 3, 3.75, 1.3));
// A 1:1 triangle uses the full fitted height and leaves room for the status
// mark. The former wider triangle lost vertical room when its width was fit.
const warning = "M12 3L21 21H3Z";
put(
  "warning",
  withSharedMark(SF(warning), enclosedWarning),
  withSharedMark(F(warning), enclosedWarning, true),
);
const watchJoins = [8.25, 15.75]
  .map(
    (x) =>
      circularCrossJunction(x, 6.75, 1.5, undefined, [
        [-1, -1],
        [1, -1],
      ]) +
      circularCrossJunction(x, 17.25, 1.5, undefined, [
        [-1, 1],
        [1, 1],
      ]),
  )
  .join("");
const straps =
  SF("M8.25 6.75v-4.5h7.5v4.5M8.25 17.25v4.5h7.5v-4.5") + watchJoins;
put(
  "watch",
  straps + R(5.25, 6.75, 13.5, 10.5) + S("M12 9V12L14 13.33333"),
  F(box(8.25, 2.25, 7.5, 4.5) + box(8.25, 17.25, 7.5, 4.5)) +
    F(
      `${box(5.25, 6.75, 13.5, 10.5)}M12.75 9V11.59861L14.41602 12.70929L13.58398 13.95737L11.25 12.40139V9Z`,
    ) +
    R(5.25, 6.75, 13.5, 10.5) +
    straps,
);
put("waveform", S("M3 9v6M7.5 5.25v13.5M12 1.5v21M16.5 6.75v10.5M21 9.75v4.5"));
const weightBody = "M5.25 9.75h13.5l3 12H2.25Z";
const weightHandle = C(12, 6, 3.75) + circleOnBaseJunction(12, 6, 3.75, 1.5);
put(
  "weight",
  weightHandle + SF(weightBody, { turns: "all" }),
  weightHandle + F(weightBody) + SF(weightBody, { turns: "all" }),
);
const wifi =
  S(
    "M2.25 7.5Q12-1.5 21.75 7.5M5.25 11.25Q12 4.5 18.75 11.25M8.25 15Q12 11.25 15.75 15",
  ) + dot(12, 19.5, 1.35);
put("wifi", wifi);
// Trim the original Wi-Fi curves using their complete flat cap corners.
// Final W = 7/6 balances the 1 and 4/3 theme widths without moving the slash.
put(
  "wifi-disabled",
  S(
    "M2.25 7.5Q2.642573 7.137625 3.035146 6.804431M7.917014 3.789149Q14.833507 1.115545 21.75 7.5M5.25 11.25Q5.829225 10.670775 6.40845 10.190958M12.394656 7.886537Q15.572328 8.072328 18.75 11.25M8.25 15Q9.028264 14.221736 9.806528 13.766509",
  ) +
    dot(12, 19.5, 1.35) +
    slash(),
);
const womanHead = circ(12, 4.5, 2.25);
const dress = "M10.5 9.75h3L16 17.25H8Z";
// Like Man, the filled body preserves the complete W=1.5 exterior in the
// outline frame. Its leg opening reaches the exterior as one notch.
const womanSolidBody = concavePolygon([
  [14.252936, 8.7053566], [9.7470636, 8.7053566], [6.5506353, 18.294643],
  [7.9553571, 18.294643], [7.9553571, 22.794643], [11.25, 22.794643],
  [11.25, 17.25], [12.75, 17.25], [12.75, 22.794643],
  [16.044643, 22.794643], [16.044643, 18.294643], [17.449364, 18.294643],
], .4, new Set([3, 10]));
// Two flat-ended legs keep an open gap at 12px. The former boxed legs
// supplied three crowded rails and a bottom divider instead of two limbs.
// Flat caps stop at the retained solid baseline (the old painted edge), so
// the shared outline-led fit does not enlarge or clip the solid companion.
const womanLegJoins = [9.75, 14.25].map((x) =>
  circularCrossJunction(x, 17.25, 1.5, undefined, [[-1, 1], [1, 1]]),
).join("");
put(
  "woman",
  S(womanHead) + S(dress) + S("M9.75 17.25V22.794643M14.25 17.25V22.794643") + womanLegJoins,
  F(womanHead) + S(womanHead) + F(womanSolidBody),
);
const treeCrown =
  "M6.75 18.75a5.25 5.25 0 0 1-1.5-10.25a6.75 6.75 0 0 1 13.5 0a5.25 5.25 0 0 1-1.5 10.25Z";
// The same closed branch contour supplies positive paint and the inverse
// counter. Its 1.8-unit local band keeps the short branch tips readable;
// only the four concave roots receive .6-unit circular fillets. The exterior
// trunk and canopy retain the family's configurable stroke.
const branchHalfWidth = 0.9;
const diagonalHalfWidth = branchHalfWidth / Math.SQRT2;
const branchNormal = [3 / Math.hypot(4.5, 3), 4.5 / Math.hypot(4.5, 3)];
const rightJoin = (side) =>
  12.75 +
  side * branchHalfWidth * branchNormal[1] -
  (2 / 3) * (branchHalfWidth - side * branchHalfWidth * branchNormal[0]);
const branchPolygon = [
  [12 - branchHalfWidth, 6.75],
  [12 + branchHalfWidth, 6.75],
  [12 + branchHalfWidth, rightJoin(-1)],
  [
    16.5 - branchHalfWidth * branchNormal[0],
    9.75 - branchHalfWidth * branchNormal[1],
  ],
  [
    16.5 + branchHalfWidth * branchNormal[0],
    9.75 + branchHalfWidth * branchNormal[1],
  ],
  [12 + branchHalfWidth, rightJoin(1)],
  [12 + branchHalfWidth, 18.75],
  [12 - branchHalfWidth, 18.75],
  [12 - branchHalfWidth, 16.5 - branchHalfWidth + 2 * diagonalHalfWidth],
  [9 - diagonalHalfWidth, 13.5 + diagonalHalfWidth],
  [9 + diagonalHalfWidth, 13.5 - diagonalHalfWidth],
  [12 - branchHalfWidth, 16.5 - branchHalfWidth - 2 * diagonalHalfWidth],
];
const branchRoots = new Set([2, 5, 8, 11]);
const branchPoint = (point) =>
  point.map((value) => Number(value.toFixed(6))).join(" ");
const woodlandBranches =
  branchPolygon
    .map((point, i, polygon) => {
      if (!branchRoots.has(i))
        return `${i === 0 ? "M" : "L"}${branchPoint(point)}`;
      const previous = polygon[(i + polygon.length - 1) % polygon.length];
      const next = polygon[(i + 1) % polygon.length];
      const unit = (other) => {
        const length = Math.hypot(other[0] - point[0], other[1] - point[1]);
        return [(other[0] - point[0]) / length, (other[1] - point[1]) / length];
      };
      const before = unit(previous);
      const after = unit(next);
      const angle = Math.acos(before[0] * after[0] + before[1] * after[1]);
      const radius = 0.6;
      const tangent = radius / Math.tan(angle / 2);
      const start = point.map((value, axis) => value + before[axis] * tangent);
      const end = point.map((value, axis) => value + after[axis] * tangent);
      return `L${branchPoint(start)}A${radius} ${radius} 0 0 0 ${branchPoint(end)}`;
    })
    .join("") + "Z";
const woodlandFrame = S(treeCrown) + L(12, 18.75, 12, 22.5) +
  circularCrossJunction(12, 18.75, 1.65, undefined, [[-1, 1], [1, 1]]);
put(
  "woodland",
  woodlandFrame + F(woodlandBranches),
  F(treeCrown + woodlandBranches) + woodlandFrame,
);
const flow =
  S(
    "M7.5 4.5h10.5a4.5 4.5 0 0 1 0 9h-3M9 13.5H7.5a3.25 3.25 0 0 0 0 6.5H21m-3-3L21 20l-3 3",
  ) +
  radialCircleJunction(4.5, 4.5, 3, 1.5) +
  radialCircleJunction(12, 13.5, 3, 1.5) +
  radialCircleJunction(12, 13.5, 3, 1.5, 180);
put(
  "workflow",
  flow + C(4.5, 4.5, 3) + C(12, 13.5, 3),
  flow +
    F(circ(4.5, 4.5, 3) + circ(12, 13.5, 3)) +
    C(4.5, 4.5, 3) +
    C(12, 13.5, 3),
);
// Retain the actual circular trajectory beneath each head fillet.
const refreshHeadJoins = circularHeadJoins(12, 12, 9, -Math.PI / 4, -1,
  [[-2.9, 0], [0, -2.9]], .3);
icons["sparkle-refresh"] = icons["sparkle-refresh"].map((drawing) => drawing + refreshHeadJoins);
icons.sync[0] += refreshHeadJoins + group(refreshHeadJoins, "rotate(180 12 12)");
const undoCenter = (() => {
  const dx = -3.75, dy = -5.625;
  const factor = Math.sqrt((8.25 ** 2 - dx ** 2 - dy ** 2) / (dx ** 2 + dy ** 2));
  return [7.5 - factor * dy, 15.375 + factor * dx];
})();
icons.undo[0] += circularHeadJoins(...undoCenter, 8.25,
  Math.atan2(9.75 - undoCenter[1], 3.75 - undoCenter[0]), 1,
  [[0, -3.6], [3.6, 0]], .36);

const straightHeadJoins = {
  "summarize": arrowRoot(21, 18.75, [-1, 0], 1.5),
  "swap": arrowRoot(20.25, 6.75, [-1, 0], 1.6) + arrowRoot(3.75, 17.25, [1, 0], 1.6),
  "tear-out": arrowRoot(21.75, 2.25, [-1, 1], 1.6),
  "upload": arrowRoot(12, 2.25, [0, 1], 1.6),
  "workflow": arrowRoot(21, 20, [-1, 0], 1.25),
  "split-view": circularCrossJunction(12, 3.75, 1.8, undefined, [[-1, 1]]) +
    circularCrossJunction(12, 20.25, 1.8, undefined, [[-1, -1]]),
  "storefront": [14.25, 17.25].map((x) =>
    circularCrossJunction(x, 20.25, 1.35, undefined, [[-1, -1], [1, -1]]),
  ).join(""),
};
for (const [name, joins] of Object.entries(straightHeadJoins))
  icons[name] = icons[name].map((drawing) => drawing ? drawing + joins : drawing);

export default icons;
