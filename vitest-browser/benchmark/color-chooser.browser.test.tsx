import { Color, ColorChooser } from "@salt-ds/lab";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "../render";

const saltColor = Color.makeColorFromHex("#D1F4C9");
const customColor = Color.makeColorFromHex("#30BC67");

async function renderChooser(
  color: Color | undefined,
  disableAlphaChooser?: boolean,
) {
  return renderWithSalt(
    <ColorChooser
      color={color}
      disableAlphaChooser={disableAlphaChooser}
      onSelect={vi.fn()}
      onClear={vi.fn()}
    />,
  );
}

describe("ColorChooser", () => {
  it("renders its trigger", async () => {
    await renderChooser(saltColor);
    await expect
      .element(page.getByRole("button", { name: "Green10" }))
      .toBeVisible();
  });

  it("renders SwatchesPicker from the Swatches tab", async () => {
    await renderChooser(saltColor);
    await page.getByRole("button", { name: "Green10" }).click();
    await page.getByText("Swatches", { exact: true }).click();
    await expect.element(page.getByTestId("swatches-picker")).toBeVisible();
  });

  it("defaults to Swatches when no color is selected", async () => {
    await renderChooser(undefined);
    await page.getByRole("button", { name: "No color selected" }).click();
    await expect
      .element(page.getByRole("tab", { name: "Swatches" }))
      .toHaveAttribute("aria-selected", "true");
    await expect.element(page.getByTestId("swatches")).toBeVisible();
  });

  it("shows Swatches first for a Salt color", async () => {
    await renderChooser(saltColor);
    await page.getByRole("button", { name: "Green10" }).click();
    await expect
      .element(page.getByRole("tab", { name: "Swatches" }))
      .toHaveAttribute("aria-selected", "true");
    await expect.element(page.getByTestId("swatches-picker")).toBeVisible();
  });

  it("shows Color Picker first for a custom color", async () => {
    await renderChooser(customColor);
    await page.getByRole("button", { name: "#30bc67" }).click();
    await expect
      .element(page.getByRole("tab", { name: "Color Picker" }))
      .toHaveAttribute("aria-selected", "true");
    await expect.element(page.getByTestId("color-picker")).toBeVisible();
  });

  it.skip("uses empty color inputs when rendered without a value", async () => {
    await renderChooser(undefined, true);
    await page.getByRole("button", { name: "No color selected" }).click();
    await page.getByRole("tab", { name: "Color Picker" }).click();
    await expect.element(page.getByTestId("hex-input")).toHaveValue("");
    await expect.element(page.getByTestId("r-input")).toHaveValue("0");
    await expect.element(page.getByTestId("g-input")).toHaveValue("0");
    await expect.element(page.getByTestId("b-input")).toHaveValue("0");
  });

  it.skip("dismisses Swatches after choosing Default", async () => {
    await renderChooser(saltColor);
    await page.getByRole("button", { name: "Green10" }).click();
    await page.getByRole("tab", { name: "Swatches" }).click();
    await page.getByRole("button", { name: /default/i }).click();
    await expect
      .element(page.getByTestId("swatches-picker"))
      .not.toBeInTheDocument();
  });

  it.skip("defaults an empty alpha value to zero", async () => {
    await renderChooser(saltColor);
    await page.getByRole("button", { name: "Green10" }).click();
    await page.getByRole("tab", { name: "Color Picker" }).click();
    const alphaElement = Array.from(
      document.querySelectorAll<HTMLInputElement>("[data-testid='a-input']"),
    ).find((element) => element.offsetParent !== null);
    if (!alphaElement) throw new Error("Missing visible alpha input");
    const alpha = page.elementLocator(alphaElement);
    await alpha.fill("");
    alphaElement.blur();
    await expect.element(alpha).toHaveValue("0");
  });

  it.skip("defaults empty RGB values to zero", async () => {
    await renderChooser(saltColor);
    await page.getByRole("button", { name: "Green10" }).click();
    await page.getByRole("tab", { name: "Color Picker" }).click();
    const redElement = Array.from(
      document.querySelectorAll<HTMLInputElement>("input"),
    ).find((element) => element.value === "209");
    if (!redElement) throw new Error("Missing red input");
    const red = page.elementLocator(redElement);
    await red.fill("");
    redElement.blur();
    await expect.element(red).toHaveValue("0");
  });

  it.skip("updates Color Picker after selecting a default swatch", async () => {
    await renderChooser(saltColor, true);
    await page.getByRole("button", { name: "Green10" }).click();
    await page.getByRole("tab", { name: "Swatches" }).click();
    await page.getByRole("button", { name: /default/i }).click();
    await page.getByRole("button", { name: "Purple" }).click();
    await page.getByRole("tab", { name: "Color Picker" }).click();
    await expect.element(page.getByTestId("hex-input")).toHaveValue("964EA2");
    await expect.element(page.getByTestId("r-input")).toHaveValue("150");
    await expect.element(page.getByTestId("b-input")).toHaveValue("78");
    await expect.element(page.getByTestId("g-input")).toHaveValue("162");
  });
});
