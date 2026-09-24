// Compare each connected painted component's exterior, including components
// nested inside a frame. Enclosed holes may fill; detached marks may not move.
// Pure function shared by Node tests and the browser audit.
export function compareComponentContours(
  left,
  right,
  side,
  pixelsPerUnit,
  tolerance = 0.05,
) {
  if (left.length !== side * side || right.length !== left.length)
    throw new Error("Expected square binary masks");
  const exterior = (mask) => {
    const seen = new Uint8Array(mask.length);
    const boundary = new Uint8Array(mask.length);
    const queue = new Int32Array(mask.length);
    let count = 0;
    for (let seed = 0; seed < mask.length; seed++) {
      if (!mask[seed] || seen[seed]) continue;
      count++;
      let head = 0,
        tail = 1;
      queue[0] = seed;
      seen[seed] = 1;
      let minX = side,
        minY = side,
        maxX = 0,
        maxY = 0;
      while (head < tail) {
        const p = queue[head++],
          x = p % side,
          y = Math.floor(p / side);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx,
              ny = y + dy,
              q = ny * side + nx;
            if (
              nx < 0 ||
              nx >= side ||
              ny < 0 ||
              ny >= side ||
              seen[q] ||
              !mask[q]
            )
              continue;
            seen[q] = 1;
            queue[tail++] = q;
          }
      }
      // Isolate this component before flooding its outside. A surrounding
      // ring must not hide the silhouette of a separate symbol inside it.
      const width = maxX - minX + 3,
        height = maxY - minY + 3;
      const local = new Uint8Array(width * height);
      for (let i = 0; i < tail; i++) {
        const p = queue[i];
        local[
          (Math.floor(p / side) - minY + 1) * width + (p % side) - minX + 1
        ] = 1;
      }
      const flood = new Int32Array(local.length);
      let start = 0,
        end = 1;
      local[0] = 2;
      while (start < end) {
        const p = flood[start++],
          x = p % width,
          y = Math.floor(p / width);
        for (const [dx, dy] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const nx = x + dx,
            ny = y + dy,
            q = ny * width + nx;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height || local[q])
            continue;
          local[q] = 2;
          flood[end++] = q;
        }
      }
      for (let i = 0; i < tail; i++) {
        const p = queue[i],
          q = (Math.floor(p / side) - minY + 1) * width + (p % side) - minX + 1;
        if ([q - 1, q + 1, q - width, q + width].some((n) => local[n] === 2))
          boundary[p] = 1;
      }
    }
    return { boundary, count };
  };
  const a = exterior(left),
    b = exterior(right);
  // An eight-neighbour distance transform estimates the symmetric maximum
  // contour displacement. It slightly overestimates Euclidean distance,
  // conservatively; tolerance is in final viewBox units, never recipe units.
  const distances = (boundary) => {
    const d = new Float32Array(boundary.length);
    for (let i = 0; i < d.length; i++) d[i] = boundary[i] ? 0 : side * 2;
    for (let y = 0; y < side; y++)
      for (let x = 0; x < side; x++) {
        const p = y * side + x;
        if (x) d[p] = Math.min(d[p], d[p - 1] + 1);
        if (y) {
          d[p] = Math.min(d[p], d[p - side] + 1);
          if (x) d[p] = Math.min(d[p], d[p - side - 1] + Math.SQRT2);
          if (x + 1 < side) d[p] = Math.min(d[p], d[p - side + 1] + Math.SQRT2);
        }
      }
    for (let y = side - 1; y >= 0; y--)
      for (let x = side - 1; x >= 0; x--) {
        const p = y * side + x;
        if (x + 1 < side) d[p] = Math.min(d[p], d[p + 1] + 1);
        if (y + 1 < side) {
          d[p] = Math.min(d[p], d[p + side] + 1);
          if (x) d[p] = Math.min(d[p], d[p + side - 1] + Math.SQRT2);
          if (x + 1 < side) d[p] = Math.min(d[p], d[p + side + 1] + Math.SQRT2);
        }
      }
    return d;
  };
  const da = distances(a.boundary),
    db = distances(b.boundary);
  let maximum = 0;
  for (let i = 0; i < left.length; i++) {
    if (a.boundary[i]) maximum = Math.max(maximum, db[i]);
    if (b.boundary[i]) maximum = Math.max(maximum, da[i]);
  }
  const maximumDelta = maximum / pixelsPerUnit;
  return {
    outlineComponents: a.count,
    solidComponents: b.count,
    maximumDelta,
    tolerance,
    matches: a.count > 0 && a.count === b.count && maximumDelta <= tolerance,
  };
}
