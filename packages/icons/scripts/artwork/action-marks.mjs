import { F, group, S } from "./primitives.mjs";
import { tickPaths } from "./tick.mjs";

// A tick is a secondary action here, so it follows the primary stroke rather
// than the larger, fixed contour used in status badges. Keep its flat terminals
// and 45-degree arms, with space for the cloud lobes and the bell's full skirt.
// The short arm is half the long arm, as in the shared status tick. Its scale
// and placement are local to the parent object.
// Each filled variant retains the same outer linework and compact action;
// filling the surface must not move those landmarks during viewBox fitting.
const compactTick = ([x, y], shortArm) =>
  tickPaths([
    [x - 3 * shortArm, y + shortArm],
    [x - 2 * shortArm, y + 2 * shortArm],
    [x, y],
  ]).line;

const cloudOutline =
  "M4.7 12.25C2.87746 12.25 1.4 10.77254 1.4 8.95C1.4 7.31 2.59633 5.94942 4.1639 5.69333C4.91833 4.35431 6.35356 3.45 8 3.45C8.75761 3.45 9.47049 3.64147 10.0929 3.97867M12.80724 6.92119C13.85406 7.30993 14.6 8.31785 14.6 9.5C14.6 11.01878 13.36877 12.25 11.85 12.25L4.7 12.25";
const cloudFill =
  "M4.7 12.585Q3.194337 12.585 2.129668 11.520331Q1.065 10.455663 1.065 8.95Q1.065 5.941167 3.952304 5.390582Q5.312528 3.115 8 3.115Q9.905252 3.115 11.066573 4.06566L7.616667 7.515566L5.353553 5.252453L3.585786 7.02022L7.616667 11.0511L12.454529 6.213238Q12.498713 6.348106 12.538302 6.488842Q14.935 6.963768 14.935 9.5Q14.935 12.585 11.85 12.585Z";
const cloudTick = compactTick([12.85, 4.05], 7.85 / 3);
const cloudLines = S(cloudOutline, 1) + S(cloudTick, 1);
export const cloudSuccess = [
  group(cloudLines, "scale(1.5)"),
  group(F(cloudFill) + cloudLines, "scale(1.5)"),
];

const bellOutline =
  "M6.75 9C6.75 6.10051 9.10051 3.75 12 3.75C14.21198 3.75 16.10445 5.11798 16.87755 7.05407M17.87735 13.69103L20.25 17.25L3.75 17.25L6.75 12.75L6.75 9";
const bellFill =
  "M6.75 9C6.75 6.10051 9.10051 3.75 12 3.75C14.54089 3.75 16.6602 5.55506 17.14555 7.9528L16.166667 8.931683L14.28033 7.045347L11.62868 9.696997L14.840837 12.909163L16.166667 14.234983L17.41066 12.99099L20.25 17.25L3.75 17.25L6.75 12.75L6.75 9Z";
const bellTick = compactTick([21, 6.75], 7.25 / 3);
const bellLines =
  S(bellOutline) + S("M9.75 20.25h4.5M12 3.75v-1.5") + S(bellTick);
export const notificationRead = [bellLines, F(bellFill) + bellLines];
