import { F, group, S } from "./primitives.mjs";
import { tickPaths } from "./tick.mjs";

// A tick is a secondary action here, so it follows the primary stroke rather
// than the larger, fixed contour used in status badges. Keep its flat terminals
// and 45-degree arms, with space for the cloud lobes and the bell's full skirt.
// The short arm is half the long arm, as in the shared status tick. Its scale
// and placement are local to the parent object.
// Both surfaces retain the same outer landmarks and compact action;
// filling the surface must not move those landmarks during viewBox fitting.
const compactTick = ([x, y], shortArm) =>
  tickPaths([
    [x - 3 * shortArm, y + shortArm],
    [x - 2 * shortArm, y + 2 * shortArm],
    [x, y],
  ]).line;

// Clip the original cloud curves against the complete painted tick at W7/6,
// midway between the two theme widths. Include each border cap corner.
const cloudOutline =
  "M4.7 12.25C2.87746 12.25 1.4 10.77254 1.4 8.95C1.4 7.31 2.59633 5.94942 4.1639 5.69333C4.91833 4.35431 6.35356 3.45 8 3.45C8.773001 3.45 9.499445 3.649336 10.130734 3.999408M12.838159 6.932882C13.868721 7.329847 14.6 8.329523 14.6 9.5C14.6 11.01878 13.36877 12.25 11.85 12.25L4.7 12.25";
// One filled cloud silhouette, with the complete tick envelope subtracted.
// Match the outline's outer contour at its 1.5 fit width; shared framing keeps
// the compact tick identical in both variants. The opening has 0.6 final-unit
// side clearance at W4/3. The flat short terminal has 0.683333 clearance,
// balancing its fixed cap plane against changing side paint at W1 and W4/3.
const cloudFill =
  "M4.7 12.956473q-1.659533 0-2.833003-1.17347T.693527 8.95q0-3.233982 3.026777-3.891395Q5.184914 2.743527 8 2.743526q2.116236 0 3.381429 1.087669L7.616667 7.595958L5.843688 5.822979A0.643676 0.643676 0 0 0 4.933393 5.822979L4.156312 6.60006A0.643676 0.643676 0 0 0 4.156312 7.510355L7.161519 10.515562A0.643676 0.643676 0 0 0 8.071814 10.515562L12.726288 5.861088q.055781.152081.105762.311597Q15.306474 6.77246 15.306474 9.5q0 3.456473-3.456474 3.456473z";
const cloudTick = compactTick([12.85, 4.05], 7.85 / 3);
const cloudLines = S(cloudOutline, 1) + S(cloudTick, 1);
export const cloudSuccess = [
  group(cloudLines, "scale(1.5)"),
  group(F(cloudFill) + S(cloudTick, 1), "scale(1.5)"),
];

// Keep the original crown curve and skirt slope; trim their full painted
// end caps toward balanced tick clearance at the same W7/6 calibration width.
// Only the crown stop moves: keeping the skirt slope verbatim preserves fit.
const bellOutline =
  "M6.75 9C6.75 6.10051 9.10051 3.75 12 3.75C14.186781 3.75 16.061297 5.086995 16.850702 6.988138M17.87735 13.69103L20.25 17.25L3.75 17.25L6.75 12.75L6.75 9";
// One outer silhouette at the paired fit width, with an even tick clearance.
// Side clearance is 0.95 at W4/3; the fixed short terminal is 1.033333.
// At W1 and W4/3 the side/end difference stays within 1/12 final unit.
// The relief curves around the square cap corners; the tick stays unchanged.
// Do not redraw the interrupted border over this subtraction.
const bellFill =
  "M5.7762833 9Q5.7762833 6.4220567 7.5991697 4.5991702Q9.4220562 2.7762842 12 2.7762845Q14.577946 2.7762835 16.400831 4.5991697Q17.431618 5.6299562 17.879526 6.9021807L16.166666 8.6150408L15.234147 7.68252A1.341565 1.341565 0 0 0 13.336887 7.68252L12.265853 8.753554A1.341565 1.341565 0 0 0 12.265853 10.650813L15.218037 13.602997A1.341565 1.341565 0 0 0 17.115296 13.602997L18.239473 12.478819L22.069407 18.223717L1.9305941 18.223717L5.7762833 12.455182L5.7762833 9Z";
const bellTick = compactTick([21, 6.75], 7.25 / 3);
const bellDetails = S("M9.75 20.25h4.5M12 3.75v-1.5") + S(bellTick);
export const notificationRead = [
  S(bellOutline) + bellDetails,
  F(bellFill) + bellDetails,
];
