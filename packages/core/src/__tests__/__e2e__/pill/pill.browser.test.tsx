import { Pill, PillGroup } from "@salt-ds/core";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { runAxeScan } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";

describe("GIVEN a Pill", () => {
  it("renders a standard Pill", async () => {
    await renderWithSalt(<Pill>Pill text</Pill>);
    await expect.element(page.getByText("Pill text")).toBeInTheDocument();
  });

  it("renders a clickable Pill", async () => {
    await renderWithSalt(<Pill onClick={() => undefined}>Clickable Pill</Pill>);
    await expect
      .element(page.getByRole("button"))
      .toHaveTextContent("Clickable Pill");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    await renderWithSalt(<Pill onClick={onClick}>label</Pill>);
    await page.getByRole("button").click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it.each(["{Enter}", " "])("calls onClick for %s", async (key) => {
    const onClick = vi.fn();
    await renderWithSalt(<Pill onClick={onClick}>label</Pill>);
    page.getByRole("button").element().focus();
    await userEvent.keyboard(key);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders a disabled Pill", async () => {
    await renderWithSalt(
      <Pill onClick={() => undefined} disabled>
        Pill disabled
      </Pill>,
    );
    await expect.element(page.getByRole("button")).toBeDisabled();
  });

  it("has no a11y violations on load", async () => {
    const { container } = await renderWithSalt(
      <Pill onClick={() => undefined}>Pill</Pill>,
    );
    await runAxeScan(container);
  });

  it("renders selectable Pills", async () => {
    await renderWithSalt(
      <PillGroup selectionVariant="multiple">
        <Pill value="pill1">Pill 1</Pill>
        <Pill value="pill2">Pill 2</Pill>
      </PillGroup>,
    );
    await expect
      .element(page.getByRole("checkbox", { name: "Pill 1" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("checkbox", { name: "Pill 2" }))
      .toBeInTheDocument();
  });
});
