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
    const incidentList = page.getByRole("listbox", {
      name: "Select an incident",
      exact: true,
    });
    const gatewayOption = incidentList.getByRole("option", {
      name: "Order gateway",
      exact: true,
    });
    const pricingOption = incidentList.getByRole("option", {
      name: "Pricing feed",
      exact: true,
    });
    const incidents = page.getByRole("radiogroup", {
      name: "Select an incident",
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

    await filter.fill("Trading");
    await gatewayOption.click();
    await expect
      .element(gatewayOption)
      .toHaveAttribute("aria-selected", "true");
    await expect.element(incidentList).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .element(gatewayOption)
      .toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard(" ");
    await expect
      .element(pricingOption)
      .toHaveAttribute("aria-selected", "true");
    await gatewayOption.click();
    expect(
      gatewayOption.element().getBoundingClientRect().bottom,
    ).toBeLessThanOrEqual(pricingOption.element().getBoundingClientRect().top);
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
    expect(gateway.element().getBoundingClientRect().right).toBeLessThanOrEqual(
      pricing.element().getBoundingClientRect().left,
    );
    await runAxeScan(container);

    await userEvent.tab();
    await expect.element(gateway).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(pricing).toHaveFocus();
    await expect.element(pricing).toBeChecked();

    const filteredCardWidth = gateway.element().getBoundingClientRect().width;
    await filter.fill("");
    const fullCardWidth = gateway.element().getBoundingClientRect().width;
    expect(Math.abs(fullCardWidth - filteredCardWidth)).toBeLessThan(1);
    const cardHeights = [gateway, pricing, settlement].map(
      (card) => card.element().getBoundingClientRect().height,
    );
    expect(Math.max(...cardHeights) - Math.min(...cardHeights)).toBeLessThan(1);
    await gateway.getByText("Trading: Delayed order acknowledgements").click();
    await expect.element(gateway).toBeChecked();

    await filter.fill("Operations");
    expect(
      Math.abs(
        settlement.element().getBoundingClientRect().width - fullCardWidth,
      ),
    ).toBeLessThan(1);
    cards.element().focus();
    await userEvent.tab();
    await expect.element(settlement).toHaveFocus();
    await expect.element(settlement).not.toBeChecked();
    await filter.fill("Trading");
    await expect.element(gateway).toBeChecked();
    await cards.click();
    await expect.element(cards).toBeChecked();
    await pricing.getByText("Trading: Stale price updates").click();
    await expect.element(pricing).toBeChecked();
    cards.element().focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(list).toHaveFocus();
    await expect.element(list).toBeChecked();
    await expect.element(cards).not.toBeChecked();
    await expect.element(filter).toHaveValue("Trading");
    await expect
      .element(pricingOption)
      .toHaveAttribute("aria-selected", "true");
    await expect
      .element(gatewayOption)
      .toHaveAttribute("aria-selected", "false");
    await expect
      .element(
        incidentList.getByRole("option", {
          name: "Settlement queue",
          exact: true,
        }),
      )
      .not.toBeInTheDocument();
    expect(
      gatewayOption.element().getBoundingClientRect().bottom,
    ).toBeLessThanOrEqual(pricingOption.element().getBoundingClientRect().top);
  });
});
