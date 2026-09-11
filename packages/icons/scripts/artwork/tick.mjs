// Keep inverse ticks on the same three-point gesture as their stroked partner.
// The contour uses the same flat caps and mitered elbow as the stroke helper.
export const tickPaths = (points, counterWidth = 1.5) => {
  const [start, elbow, end] = points;
  const normal = (from, to) => {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const length = Math.hypot(dx, dy);
    return [-dy / length, dx / length];
  };
  const first = normal(start, elbow);
  const second = normal(elbow, end);
  const halfWidth = counterWidth / 2;
  const miterScale =
    halfWidth / (1 + first[0] * second[0] + first[1] * second[1]);
  const miter = first.map((value, axis) => (value + second[axis]) * miterScale);
  const offset = (point, vector, scale) =>
    point.map((value, axis) => value + vector[axis] * scale);
  const contour = [
    offset(start, first, halfWidth),
    offset(elbow, miter, 1),
    offset(end, second, halfWidth),
    offset(end, second, -halfWidth),
    offset(elbow, miter, -1),
    offset(start, first, -halfWidth),
  ];
  const path = (vertices) =>
    "M" +
    vertices
      .map((point) => point.map((value) => Number(value.toFixed(5))).join(" "))
      .join("L");
  return { line: path(points), counter: `${path(contour)}Z` };
};

// Lift the elbow slightly; the inverse mark keeps the same arm proportions.
export const successTick = tickPaths([
  [6.75, 11.625],
  [10.25, 15.125],
  [17.25, 8.125],
]);
