import { describe, expect, it } from "vitest";
import type { Item } from "../VerticalNavigation";
import {
  containsSelected,
  mapMenu,
  normalizeSelectedNodeId,
  statusToBadgeValue,
} from "./index";

describe("containsSelected", () => {
  const tree: Item = {
    title: "Parent",
    href: "/parent",
    children: [
      { title: "Child", href: "/child" },
      { title: "Other", href: "/other" },
    ],
  };

  it("returns true if selectedNodeId matches item.href", () => {
    expect(containsSelected(tree, "/parent")).toBe(true);
  });

  it("returns true if selectedNodeId matches a child", () => {
    expect(containsSelected(tree, "/child")).toBe(true);
  });

  it("returns false if selectedNodeId does not match", () => {
    expect(containsSelected(tree, "/none")).toBe(false);
  });

  it("returns false if selectedNodeId is undefined", () => {
    expect(containsSelected(tree, undefined)).toBe(false);
  });
});

describe("statusToBadgeValue", () => {
  it("returns initials for a single word", () => {
    expect(statusToBadgeValue("Release")).toBe("R");
  });

  it("returns initials for multiple words", () => {
    expect(statusToBadgeValue("Release Candidate")).toBe("RC");
  });

  it("returns empty string for empty status", () => {
    expect(statusToBadgeValue("")).toBe("");
  });
});

describe("normalizeSelectedNodeId", () => {
  const navData: Item[] = [
    { title: "Slider", href: "/salt/components/slider/index" },
    { title: "Button", href: "/salt/components/button" },
  ];

  it.each([
    "/examples",
    "/usage",
    "/accessibility",
  ])("replaces %s with /index if /index exists", (route) => {
    expect(
      normalizeSelectedNodeId(`/salt/components/slider${route}`, navData),
    ).toBe("/salt/components/slider/index");
  });

  it.each([
    "/examples",
    "/usage",
    "/accessibility",
  ])("removes %s if /index does not exist", (route) => {
    expect(
      normalizeSelectedNodeId(`/salt/components/button${route}`, navData),
    ).toBe("/salt/components/button");
  });

  it("returns link unchanged if not ending with a tab route", () => {
    expect(normalizeSelectedNodeId("/salt/components/slider", navData)).toBe(
      "/salt/components/slider",
    );
  });
});

describe("mapMenu", () => {
  it("maps SidebarNodeWithStatus to Item", () => {
    const input = [
      {
        kind: "data",
        id: "/foo",
        name: "Foo",
        status: "Release Candidate",
        data: { level: 1, link: "/foo", status: "Release Candidate" },
        hidden: false,
      },
    ];
    const result = mapMenu(input as any);
    expect(result).toEqual([
      {
        title: "Foo",
        href: "/foo",
        status: "Release Candidate",
        children: [],
      },
    ]);
  });

  it("removes children if only one child and its title matches parent", () => {
    const input = [
      {
        kind: "group",
        id: "/bar",
        name: "Bar",
        childNodes: [
          {
            kind: "data",
            id: "/bar/index",
            name: "Bar",
            status: "Release Candidate",
            data: { level: 2, link: "/bar", status: "Release Candidate" },
            hidden: false,
          },
        ],
        hidden: false,
      },
    ];
    const result = mapMenu(input as any);
    expect(result).toEqual([
      {
        title: "Bar",
        href: "/bar/index",
        status: undefined,
        children: undefined,
      },
    ]);
  });
});
