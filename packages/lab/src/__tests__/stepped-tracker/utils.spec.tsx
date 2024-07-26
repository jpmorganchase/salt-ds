import { describe, expect, test } from "vitest";

import {
  convertDepthsToDepthMap,
  normalizeDepthValues,
} from "../../stepped-tracker/utils";

const exampleDepths = [0, 1, 1, 0, 0, 1, 2, 2, 1, 2, 0];
const exampleOffsetDepths = [1, 2, 2, 1, 1, 2, 3, 3, 2, 3, 1];

const exampleDepthMap = [
  {
    i: 0,
    children: [
      { i: 1, children: [] },
      { i: 2, children: [] },
    ],
  },
  {
    i: 3,
    children: [],
  },
  {
    i: 4,
    children: [
      {
        i: 5,
        children: [
          {
            i: 6,
            children: [],
          },
          {
            i: 7,
            children: [],
          },
        ],
      },
      {
        i: 8,
        children: [
          {
            i: 9,
            children: [],
          },
        ],
      },
    ],
  },
  {
    i: 10,
    children: [],
  },
];

describe("convertDepthsToDepthMap", () => {
  test("should create a depth-map from an array of depths", () => {
    const depthMap = convertDepthsToDepthMap(exampleDepths);
    expect(depthMap.length).toBe(exampleDepthMap.length);
    expect(depthMap[0].children.length).toBe(
      exampleDepthMap[0].children.length,
    );
    expect(depthMap[1].children.length).toBe(
      exampleDepthMap[1].children.length,
    );
    expect(depthMap[2].children.length).toBe(
      exampleDepthMap[2].children.length,
    );
    expect(depthMap[2].children[0].children.length).toBe(
      exampleDepthMap[2].children[0].children.length,
    );
  });
});

describe("normalizeDepthValues", () => {
  test("should normalize depth values when not zero-indexed", () => {
    const normalizedDepths = normalizeDepthValues(exampleOffsetDepths);
    expect(normalizedDepths).toEqual(exampleDepths);
  });
  test("should leave correct depth values unchanged", () => {
    const depths = normalizeDepthValues(exampleDepths);
    expect(depths).toEqual(exampleDepths);
  });
});
