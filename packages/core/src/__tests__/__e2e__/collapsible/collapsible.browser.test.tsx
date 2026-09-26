import {
  Button,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as collapsibleStories from "~stories/collapsible/collapsible.stories";

const { Default } = composeStories(collapsibleStories);

describe("Given a Collapsible", () => {
  it("has the correct accessibility attributes", async () => {
    await renderWithSalt(<Default />);
    const button = page.getByRole("button");
    const panel = page.getByTestId("collapsible-panel");
    const controls = button.element().getAttribute("aria-controls");

    expect(controls).toBeTruthy();
    await expect.element(panel).toHaveAttribute("id", controls as string);
    await expect.element(button).toHaveAttribute("aria-expanded", "false");
    await expect.element(panel).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["defaultOpen", { defaultOpen: true }],
    ["open", { open: true }],
  ] as const)("supports %s", async (_name, props) => {
    await renderWithSalt(<Default {...props} />);
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("aria-expanded", "true");
    await expect.element(page.getByTestId("panel-content")).toBeVisible();
  });

  it("toggles open state on click", async () => {
    const onOpenChange = vi.fn();
    await renderWithSalt(<Default onOpenChange={onOpenChange} />);
    const button = page.getByRole("button");
    const content = page.getByTestId("panel-content");

    await button.click();
    await expect.element(content).toBeVisible();
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.anything(), true);
    await button.click();
    await expect.element(content).not.toBeVisible();
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.anything(), false);
  });

  it("toggles open state from the keyboard", async () => {
    const onOpenChange = vi.fn();
    await renderWithSalt(<Default onOpenChange={onOpenChange} />);
    const content = page.getByTestId("panel-content");

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect.element(content).toBeVisible();
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.anything(), true);
    await userEvent.keyboard(" ");
    await expect.element(content).not.toBeVisible();
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.anything(), false);
  });

  it("supports customizing the panel root with render", async () => {
    await renderWithSalt(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>
          <Button>Toggle</Button>
        </CollapsibleTrigger>
        <CollapsiblePanel
          data-testid="custom-panel"
          render={<section aria-label="Details" />}
        >
          Content
        </CollapsiblePanel>
      </Collapsible>,
    );

    const panel = page.getByTestId("custom-panel");
    await expect.element(panel).toHaveClass("saltCollapsiblePanel");
    expect(panel.element().tagName).toBe("SECTION");
    await expect
      .element(page.getByRole("button", { name: "Toggle" }))
      .toHaveAttribute("aria-controls", panel.element().id);
  });

  it("keeps aria-controls in sync with an id set on the render element", async () => {
    await renderWithSalt(
      <Collapsible>
        <CollapsibleTrigger>
          <Button>Toggle</Button>
        </CollapsibleTrigger>
        <CollapsiblePanel
          data-testid="custom-panel"
          render={<section id="custom-id" />}
        >
          Content
        </CollapsiblePanel>
      </Collapsible>,
    );

    await expect
      .element(page.getByTestId("custom-panel"))
      .toHaveAttribute("id", "custom-id");
    await expect
      .element(page.getByRole("button", { name: "Toggle" }))
      .toHaveAttribute("aria-controls", "custom-id");
  });
});
