import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { runAxeScan } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import { ToggleButtonGroupViewSwitching } from "../../site/src/examples/toggle-button/ToggleButtonGroupViewSwitching";

describe("Incident presentation switching", () => {
  it("keeps the filter and record selection while keyboard switching changes the presentation", async () => {
    const { container } = await renderWithSalt(
      <div style={{ width: "min(720px, 100vw)" }}>
        <ToggleButtonGroupViewSwitching />
      </div>,
    );
    const filter = page.getByRole("textbox", { name: "Filter incidents" });
    const view = page.getByRole("radiogroup", { name: "View", exact: true });
    const list = view.getByRole("radio", { name: "List", exact: true });
    const cards = view.getByRole("radio", { name: "Cards", exact: true });
    const incidents = page.getByRole("list", {
      name: "Incidents",
      exact: true,
    });
    const gateway = incidents.getByRole("radio", {
      name: "Order gateway",
      exact: true,
    });
    const pricing = incidents.getByRole("radio", {
      name: "Pricing feed",
      exact: true,
    });
    const settlement = page.getByRole("radio", {
      name: "Settlement queue",
      exact: true,
    });

    const firstRecord = incidents.getByRole("listitem").nth(0);
    const secondRecord = incidents.getByRole("listitem").nth(1);

    await filter.fill("Trading");
    await gateway.click();
    await expect.element(gateway).toBeChecked();
    await expect.element(settlement).not.toBeInTheDocument();
    expect(
      firstRecord.element().getBoundingClientRect().bottom,
    ).toBeLessThanOrEqual(secondRecord.element().getBoundingClientRect().top);
    await runAxeScan(container);

    list.element().focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(cards).toHaveFocus();
    await expect.element(cards).toBeChecked();
    await expect.element(list).not.toBeChecked();
    await expect.element(filter).toHaveValue("Trading");
    await expect.element(gateway).toBeChecked();
    await expect.element(pricing).not.toBeChecked();
    await expect.element(settlement).not.toBeInTheDocument();
    expect(
      firstRecord.element().getBoundingClientRect().right,
    ).toBeLessThanOrEqual(secondRecord.element().getBoundingClientRect().left);
    await runAxeScan(container);

    await cards.click();
    await expect.element(cards).toBeChecked();
    await pricing.click();
    await expect.element(pricing).toBeChecked();
    cards.element().focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(list).toHaveFocus();
    await expect.element(list).toBeChecked();
    await expect.element(cards).not.toBeChecked();
    await expect.element(filter).toHaveValue("Trading");
    await expect.element(pricing).toBeChecked();
    await expect.element(gateway).not.toBeChecked();
    await expect.element(settlement).not.toBeInTheDocument();
    expect(
      firstRecord.element().getBoundingClientRect().bottom,
    ).toBeLessThanOrEqual(secondRecord.element().getBoundingClientRect().top);
  });
});
