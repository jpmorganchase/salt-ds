import { LinkButton } from "@salt-ds/core";
import { StackoverflowIcon } from "@salt-ds/icons";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

function selectedText(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  return selection?.toString();
}

describe("GIVEN a LinkButton", () => {
  it("renders a tear-out icon and accessible text for target blank", async () => {
    await renderWithSalt(
      <LinkButton href="#root" target="_blank">
        Action
      </LinkButton>,
    );
    await expect.element(page.getByTestId(/TearOutIcon/i)).toBeInTheDocument();
    await expect
      .element(page.getByRole("link"))
      .toHaveAccessibleName("Action Opens in a new tab");
  });

  it("excludes accessible helper text from copied text", async () => {
    await renderWithSalt(
      <LinkButton href="#root" target="_blank">
        Action
      </LinkButton>,
    );
    expect(selectedText(page.getByRole("link").element())).toBe("ACTION");
  });

  it("supports a custom icon", async () => {
    await renderWithSalt(
      <LinkButton
        href="#root"
        target="_blank"
        IconComponent={StackoverflowIcon}
      >
        Action
      </LinkButton>,
    );
    await expect
      .element(page.getByTestId(/StackOverflowIcon/i))
      .toBeInTheDocument();
  });

  it("supports accessible text without an icon", async () => {
    await renderWithSalt(
      <LinkButton href="#root" target="_blank" IconComponent={null}>
        Action
      </LinkButton>,
    );
    await expect
      .element(page.getByTestId(/TearOutIcon/i))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole("link"))
      .toHaveAccessibleName("Action Opens in a new tab");
  });

  it("does not render a tear-out icon for another target", async () => {
    await renderWithSalt(
      <LinkButton href="#root" target="blank">
        Action
      </LinkButton>,
    );
    await expect
      .element(page.getByTestId(/TearOutIcon/i))
      .not.toBeInTheDocument();
  });

  it("uses the target from a rendered element", async () => {
    await renderWithSalt(
      <LinkButton
        href="#root"
        render={
          <a
            href="https://www.saltdesignsystem.com"
            rel="noopener"
            target="_blank"
          />
        }
      >
        Action
      </LinkButton>,
    );
    await expect.element(page.getByTestId(/TearOutIcon/i)).toBeInTheDocument();
    await expect
      .element(page.getByRole("link"))
      .toHaveAccessibleName("Action Opens in a new tab");
  });

  it("lets a rendered element override target blank", async () => {
    await renderWithSalt(
      <LinkButton
        href="#root"
        target="_blank"
        render={<a href="https://www.saltdesignsystem.com" target="_self" />}
      >
        Action
      </LinkButton>,
    );
    await expect
      .element(page.getByTestId(/TearOutIcon/i))
      .not.toBeInTheDocument();
    await expect.element(page.getByRole("link")).toHaveAccessibleName("Action");
  });
});
