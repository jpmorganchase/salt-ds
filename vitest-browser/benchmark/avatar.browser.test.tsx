import { UserGroupSolidIcon } from "@salt-ds/icons";
import { composeStories } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import * as avatarStories from "~stories/avatar/avatar.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(avatarStories);
const { Default } = composedStories;
const directSizeStyle = {
  "--saltAvatar-size": "18px",
} as CSSProperties;

describe("Given an Avatar", () => {
  checkAccessibility(composedStories);

  it("shows the default fallback icon when nothing is provided", async () => {
    await renderWithSalt(<Default />);
    await expect.element(page.getByTestId("UserIcon")).toBeInTheDocument();
  });

  it("keeps direct sizing independent of the size multiplier", async () => {
    await renderWithSalt(
      <>
        <Default name="Size one" size={1} style={directSizeStyle} />
        <Default name="Size four" size={4} style={directSizeStyle} />
      </>,
    );

    const avatars = await page.getByRole("img").elements();
    expect(avatars).toHaveLength(2);

    const sizeOne = getComputedStyle(avatars[0]);
    const sizeFour = getComputedStyle(avatars[1]);
    expect(sizeOne.width).toBe("18px");
    expect(sizeOne.height).toBe("18px");
    expect(sizeFour.width).toBe("18px");
    expect(sizeFour.height).toBe("18px");
    expect(sizeFour.fontSize).toBe(sizeOne.fontSize);
  });

  it("shows initials if only a name is provided", async () => {
    await renderWithSalt(<Default name="Juanito Jones" />);
    await expect
      .element(page.getByRole("img"))
      .toHaveAccessibleName("Juanito Jones");
    await expect.element(page.getByText("JJ")).toBeInTheDocument();
  });

  it("shows initials when an image fails and a name is provided", async () => {
    await renderWithSalt(<Default src="bad_url.png" name="Juanito Jones" />);
    await expect
      .element(page.getByRole("img"))
      .toHaveAccessibleName("Juanito Jones");
    await expect.element(page.getByText("JJ")).toBeInTheDocument();
  });

  it("shows a fallback icon when an image fails without a name", async () => {
    await renderWithSalt(<Default src="bad_url.png" />);
    await expect.element(page.getByTestId("UserIcon")).toBeInTheDocument();
    await expect.element(page.getByRole("img")).not.toBeInTheDocument();
  });

  it("shows an image for a valid image URL", async () => {
    await renderWithSalt(
      <Default
        src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='18' fill='blue'/></svg>"
        name="Juanito Jones"
      />,
    );
    await expect
      .element(page.getByRole("img", { name: "Juanito Jones" }))
      .toBeInTheDocument();
    await expect.poll(() => document.querySelector("img")).not.toBeNull();
  });

  it("shows an image provided via children", async () => {
    await renderWithSalt(
      <Default>
        <img src="blah.png" alt="" />
      </Default>,
    );

    expect(document.querySelector("img")).toHaveAttribute("src", "blah.png");
  });

  it("supports a custom fallback icon", async () => {
    await renderWithSalt(<Default fallbackIcon={<UserGroupSolidIcon />} />);
    await expect
      .element(page.getByTestId("UserGroupSolidIcon"))
      .toBeInTheDocument();
  });

  it("defaults to a circular person avatar", async () => {
    await renderWithSalt(<Default />);
    await expect.element(page.getByTestId("UserIcon")).toBeInTheDocument();
    expect(document.querySelector(".saltAvatar")).not.toHaveClass(
      "saltAvatar-entity",
    );
  });

  it("renders an entity avatar with the business fallback icon", async () => {
    await renderWithSalt(<Default kind="entity" />);
    await expect.element(page.getByTestId("BankIcon")).toBeInTheDocument();
    expect(document.querySelector(".saltAvatar")).toHaveClass(
      "saltAvatar-entity",
    );
  });

  it("supports a custom fallback icon for an entity", async () => {
    await renderWithSalt(
      <Default kind="entity" fallbackIcon={<UserGroupSolidIcon />} />,
    );
    await expect
      .element(page.getByTestId("UserGroupSolidIcon"))
      .toBeInTheDocument();
    await expect.element(page.getByTestId("BankIcon")).not.toBeInTheDocument();
  });

  it("preserves button semantics when rendered as a button", async () => {
    await renderWithSalt(
      <Default name="Juanito Jones" render={<button type="button" />} />,
    );

    await expect
      .element(page.getByRole("button", { name: "Juanito Jones" }))
      .toHaveClass("saltAvatar");
    await expect.element(page.getByRole("img")).not.toBeInTheDocument();
  });

  it("calls a render function with the merged props", async () => {
    const testId = "avatar-testid";
    const mockRender = vi.fn((_props: Record<string, unknown>) => (
      <button type="button" data-testid={testId}>
        JJ
      </button>
    ));

    await renderWithSalt(<Default name="Juanito Jones" render={mockRender} />);

    await expect.element(page.getByTestId(testId)).toBeInTheDocument();
    expect(mockRender).toHaveBeenCalled();
    expect(mockRender.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        className: expect.any(String),
        children: expect.anything(),
        style: expect.any(Object),
        "aria-label": "Juanito Jones",
      }),
    );
  });

  it("merges props when render is a JSX element", async () => {
    const testId = "avatar-testid";
    await renderWithSalt(
      <Default
        name="Juanito Jones"
        render={<button type="button" data-testid={testId} />}
      />,
    );

    await expect
      .element(page.getByRole("button", { name: "Juanito Jones" }))
      .toHaveAttribute("data-testid", testId);
  });

  it("has no image role or aria-label without a name", async () => {
    await renderWithSalt(<Default />);
    await expect.element(page.getByRole("img")).not.toBeInTheDocument();
    expect(document.querySelector("[aria-label]")).toBeNull();
  });
});
