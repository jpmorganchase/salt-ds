import { Link } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import * as linkStories from "~stories/link/link.stories";
import { renderWithSalt } from "../render";

const { TargetBlankCustomIcon } = composeStories(linkStories);
const testHref = "https://www.saltdesignsystem.com";

function selectedText(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  return selection?.toString();
}

describe("GIVEN a link", () => {
  it("renders children", async () => {
    await renderWithSalt(
      <Link href={testHref} data-testid="children-testid">
        hello world
      </Link>,
    );
    await expect
      .element(page.getByTestId("children-testid"))
      .toBeInTheDocument();
  });

  it("renders a tear-out icon and accessible text for target blank", async () => {
    await renderWithSalt(
      <Link href={testHref} target="_blank" rel="noopener">
        Action
      </Link>,
    );
    await expect.element(page.getByTestId(/TearOutIcon/i)).toBeInTheDocument();
    await expect
      .element(page.getByRole("link"))
      .toHaveAccessibleName("Action Opens in a new tab");
  });

  it("excludes accessible helper text from copied text", async () => {
    await renderWithSalt(
      <Link href={testHref} target="_blank" rel="noopener">
        Action
      </Link>,
    );
    expect(selectedText(page.getByRole("link").element())).toBe("Action");
  });

  it("supports a custom tear-out icon", async () => {
    await renderWithSalt(<TargetBlankCustomIcon />);
    await expect
      .element(page.getByTestId(/CustomTearOutIcon/i))
      .toBeInTheDocument();
  });

  it("does not render a tear-out icon for another target", async () => {
    await renderWithSalt(
      <Link href={testHref} target="blank">
        Action
      </Link>,
    );
    await expect
      .element(page.getByTestId(/TearOutIcon/i))
      .not.toBeInTheDocument();
  });

  it("calls a render function with merged props", async () => {
    const mockRender = vi.fn().mockReturnValue(
      <a href={testHref} data-testid="link-testid">
        Action
      </a>,
    );
    await renderWithSalt(<Link href={testHref} render={mockRender} />);
    await expect.element(page.getByTestId("link-testid")).toBeInTheDocument();
    const renderProps = mockRender.mock.calls[0][0];
    expect(renderProps).toEqual(
      expect.objectContaining({ className: expect.any(String) }),
    );
    expect(renderProps).toHaveProperty("children");
  });

  it("merges props into a rendered JSX element", async () => {
    await renderWithSalt(
      <Link
        href={testHref}
        render={
          <a href={testHref} data-testid="link-testid">
            Action
          </a>
        }
      />,
    );
    await expect.element(page.getByTestId("link-testid")).toBeInTheDocument();
  });

  it("uses target blank from a rendered JSX element", async () => {
    await renderWithSalt(
      <Link
        href={testHref}
        render={<a href={testHref} rel="noopener" target="_blank" />}
      >
        Action
      </Link>,
    );
    await expect.element(page.getByTestId(/TearOutIcon/i)).toBeInTheDocument();
    await expect
      .element(page.getByRole("link"))
      .toHaveAccessibleName("Action Opens in a new tab");
  });

  it("lets a rendered JSX element override target blank", async () => {
    await renderWithSalt(
      <Link
        href={testHref}
        target="_blank"
        render={<a href={testHref} target="_self" />}
      >
        Action
      </Link>,
    );
    await expect
      .element(page.getByTestId(/TearOutIcon/i))
      .not.toBeInTheDocument();
    await expect.element(page.getByRole("link")).toHaveAccessibleName("Action");
  });
});
