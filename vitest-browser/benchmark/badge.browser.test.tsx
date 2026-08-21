import { Badge } from "@salt-ds/core";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "../render";

describe("GIVEN a Badge", () => {
  it.each([
    [100, 99, "99+"],
    [99, 99, "99"],
    [98, 99, "98"],
    [1000, undefined, "999+"],
  ] as const)("renders value %s with max %s", async (value, max, output) => {
    await renderWithSalt(<Badge value={value} max={max} />);
    await expect.element(page.getByText(output)).toBeInTheDocument();
  });

  it("can render a string", async () => {
    await renderWithSalt(<Badge value="lots" />);
    await expect.element(page.getByText("lots")).toBeInTheDocument();
  });

  it("can render with a custom text child", async () => {
    await renderWithSalt(<Badge value={1}>Lorem Ipsum</Badge>);
    await expect.element(page.getByText("Lorem Ipsum")).toBeInTheDocument();
  });
});
