import { checkCutoutPaint } from "./check-cutout-paint.mjs";

const weights = [0.67];
const interpolate = (a, b, t) =>
  a.map((value, index) => value + (b[index] - value) * t);
function bezier(controls, t) {
  let points = controls;
  while (points.length > 1)
    points = points
      .slice(0, -1)
      .map((point, index) => interpolate(point, points[index + 1], t));
  return points[0];
}
function bisect(fn, target, lo, hi) {
  const increasing = fn(hi) > fn(lo);
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (fn(mid) < target === increasing) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
function distanceToBezier(point, controls) {
  const distance = (t) =>
    Math.hypot(
      ...bezier(controls, t).map((value, index) => value - point[index]),
    );
  const sampled = Array.from({ length: 65 }, (_, i) => distance(i / 64));
  const index = sampled.indexOf(Math.min(...sampled));
  let lo = Math.max(0, (index - 1) / 64);
  let hi = Math.min(1, (index + 1) / 64);
  for (let i = 0; i < 45; i++) {
    const a = lo + (hi - lo) * 0.38196601125;
    const b = lo + (hi - lo) * 0.61803398875;
    if (distance(a) < distance(b)) hi = b;
    else lo = a;
  }
  return Math.min(sampled[0], sampled[64], distance((lo + hi) / 2));
}

// Expectations derive from the unchanged ordinary foreground and rear paths,
// plus the agreed clearance. They never read the generated cutout controls.
export function checkCutoutPeople(page, records) {
  const groupProbes = [0.76, 0.8, 0.84, 0.88, 0.92, 0.96].map((t) => {
    const vx = 9 * (1 - t);
    const vy = 6 * t;
    const speed = Math.hypot(vx, vy);
    return {
      feature: `curved shoulder normal t=${t}`,
      point: bezier(
        [
          [5.5, 9],
          [10, 9],
          [10, 12],
        ],
        t,
      ),
      normal: [vy / speed, -vx / speed],
      expected: 2,
    };
  });
  groupProbes.push({
    feature: "straight torso side",
    point: [10, 13],
    normal: [1, 0],
    expected: 2,
  });

  const frontGroupShoulder = [
    [5.5, 9],
    [10, 9],
    [10, 12],
  ];
  const rearGroupShoulder = [
    [9, 12],
    [9, 9.5],
    [12, 9.5],
  ];
  const rearParameter = bisect(
    (parameter) =>
      distanceToBezier(
        bezier(rearGroupShoulder, parameter),
        frontGroupShoulder,
      ),
    2,
    0.7,
    1,
  );
  const rearStop = bezier(rearGroupShoulder, rearParameter);
  const rearTangent = [6 * rearParameter, -5 * (1 - rearParameter)];
  const rearLength = Math.hypot(...rearTangent);
  const rearNormal = [
    -rearTangent[1] / rearLength,
    rearTangent[0] / rearLength,
  ];
  const groupOutlineExpected = Object.fromEntries(
    weights.map((weight) => {
      const corners = [-1, 1].map((sign) =>
        rearStop.map(
          (value, index) => value + (sign * weight * rearNormal[index]) / 2,
        ),
      );
      return [
        weight,
        Math.min(
          ...corners.map((point) =>
            distanceToBezier(point, frontGroupShoulder),
          ),
        ) -
          weight / 2,
      ];
    }),
  );

  const center = [11.5, 10.5];
  const searchShoulder = [
    [6, 9],
    [10.5, 9],
    [10.5, 12],
  ];
  const radiusToSearch = (t) =>
    Math.hypot(
      ...bezier(searchShoulder, t).map((value, i) => value - center[i]),
    );
  const t = bisect(radiusToSearch, 4.5, 0, 1);
  const shoulderStop = bezier(searchShoulder, t);
  const tangent = [9 * (1 - t), 6 * t];
  const length = Math.hypot(...tangent);
  const shoulderNormal = [-tangent[1] / length, tangent[0] / length];
  const lowerStop = [center[0] - Math.sqrt(4.5 ** 2 - 3.5 ** 2), 14];
  const searchExpected = (point, normal) =>
    Object.fromEntries(
      weights.map((weight) => {
        const corners = [-1, 1].map((sign) =>
          point.map((value, i) => value + (sign * weight * normal[i]) / 2),
        );
        const distance = Math.min(
          ...corners.map((corner) =>
            Math.hypot(corner[0] - center[0], corner[1] - center[1]),
          ),
        );
        return [weight, distance - 2.5 - weight / 2];
      }),
    );

  const leftShoulder = [
    [7, 77 / 6],
    [7, 353 / 30],
    [25 / 3, 67 / 6],
    [10.5, 67 / 6],
  ];
  const rightShoulder = [
    [10.5, 67 / 6],
    [38 / 3, 67 / 6],
    [14, 353 / 30],
    [14, 77 / 6],
  ];
  const feedbackDistance = (point) =>
    Math.min(
      distanceToBezier(point, leftShoulder),
      distanceToBezier(point, rightShoulder),
      Math.hypot(point[0] - 10.5, point[1] - 7.5) - 1.6,
    );
  const rightOutline = [
    14.5,
    bisect((y) => feedbackDistance([14.5, y]), 2, 9, 11),
  ];
  const leftOutline = [
    bisect((x) => feedbackDistance([x, 10.5]), 2, 5, 8),
    10.5,
  ];
  const leftSolid = [
    bisect((x) => feedbackDistance([x, 10.5]), 1.25, 6, 9),
    10.5,
  ];
  const rightSolid = [
    bisect((x) => feedbackDistance([x, 10.5]), 1.25, 12, 14.5),
    10.5,
  ];
  const feedbackExpected = (point, normal, outlined) =>
    Object.fromEntries(
      weights.map((weight) => {
        const corners = [-1, 1].map((sign) =>
          point.map((value, i) => value + (sign * weight * normal[i]) / 2),
        );
        return [
          weight,
          Math.min(...corners.map(feedbackDistance)) -
            (outlined ? weight / 2 : 0),
        ];
      }),
    );

  return checkCutoutPaint(page, records, [
    {
      name: "user-group.svg",
      rear: "group-outline",
      foreground: "group-outline",
      rearRegion: [11, 8, 16, 16],
      foregroundRegion: [0, 8, 11, 16],
      probes: [
        {
          feature: "rear shoulder stop to foreground shoulder",
          region: [10.8, 8.7, 12.5, 10.5],
          expected: groupOutlineExpected,
        },
        {
          feature: "rear torso base stop to foreground side",
          region: [11.8, 13, 12.5, 15],
          expected: Object.fromEntries(
            weights.map((weight) => [weight, 2 - weight / 2]),
          ),
        },
      ],
    },
    {
      name: "user-group_solid.svg",
      rear: "group-rear",
      foreground: "group-front",
      probes: groupProbes,
    },
    {
      name: "user-search.svg",
      rear: "search-body",
      foreground: "search-mark",
      probes: [
        {
          feature: "upper shoulder to magnifier",
          region: [5.5, 8.3, 8, 10.2],
          expected: searchExpected(shoulderStop, shoulderNormal),
        },
        {
          feature: "lower torso to magnifier",
          region: [7.4, 13, 9.5, 14.9],
          expected: searchExpected(lowerStop, [0, 1]),
        },
      ],
    },
    {
      name: "feedback.svg",
      rear: "feedback-panel",
      foreground: "feedback-person",
      probes: [
        {
          feature: "right panel stop to outlined person",
          region: [13, 7.5, 15.5, 11.5],
          expected: feedbackExpected(rightOutline, [1, 0], true),
        },
        {
          feature: "left panel stop to outlined person",
          region: [5, 9.5, 8.5, 11.5],
          expected: feedbackExpected(leftOutline, [0, 1], true),
        },
      ],
    },
    {
      name: "feedback_solid.svg",
      rear: "feedback-panel",
      foreground: "feedback-person",
      probes: [
        {
          feature: "right panel stop to filled person",
          region: [13, 7.5, 15.5, 11.5],
          expected: feedbackExpected(rightSolid, [0, 1], false),
        },
        {
          feature: "left panel stop to filled person",
          region: [5, 9.5, 8.5, 11.5],
          expected: feedbackExpected(leftSolid, [0, 1], false),
        },
      ],
    },
  ]);
}
