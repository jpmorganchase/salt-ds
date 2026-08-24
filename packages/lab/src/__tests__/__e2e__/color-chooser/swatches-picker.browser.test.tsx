import { Color, Swatch, SwatchesPicker } from "@salt-ds/lab";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

const colorResult = Color.makeColorFromHex("#333333");

describe("SwatchesPicker", () => {
  it("renders", async () => {
    await renderWithSalt(
      <SwatchesPicker
        color={colorResult}
        allColors={[["#ffffff"], ["#333333"]]}
        onChange={vi.fn()}
        onDialogClosed={vi.fn()}
      />,
    );
    await expect
      .element(page.getByTestId("swatches-picker"))
      .toBeInTheDocument();
  });

  it("applies the alpha channel to swatches", async () => {
    await renderWithSalt(
      <SwatchesPicker
        color={colorResult}
        allColors={[["#ffffff"], ["#333333"]]}
        onChange={vi.fn()}
        alpha={0.1}
        onDialogClosed={vi.fn()}
      />,
    );
    await expect
      .element(page.getByTestId("swatch-#333333"))
      .toHaveStyle({ backgroundColor: "rgba(51, 51, 51, 0.1)" });
  });

  it("reports changed colors", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <SwatchesPicker
        color={colorResult}
        allColors={[["#ffffff"], ["#333333"]]}
        onChange={onChange}
        onDialogClosed={vi.fn()}
      />,
    );
    expect(onChange).not.toHaveBeenCalled();
    await page.getByTestId("swatch-#333333").click();
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0]).toMatchObject({
      color: { _a: 1, _b: 51, _g: 51, _r: 51 },
    });
    expect(onChange.mock.calls[0][1]).toBe(true);
  });

  describe("Swatch", () => {
    async function renderSwatch(
      options: {
        active?: boolean;
        alpha?: number;
        onClick?: () => void;
        onDialogClosed?: () => void;
      } = {},
    ) {
      return renderWithSalt(
        <Swatch
          color="#333"
          active={options.active ?? false}
          alpha={options.alpha ?? 0.1}
          onClick={options.onClick ?? vi.fn()}
          onDialogClosed={options.onDialogClosed ?? vi.fn()}
        />,
      );
    }

    it("renders an alpha background", async () => {
      await renderSwatch();
      await expect
        .element(page.getByTestId("swatch-#333"))
        .toHaveStyle({ backgroundColor: "rgba(51, 51, 51, 0.1)" });
    });

    it("renders an opaque background", async () => {
      await renderSwatch({ alpha: 1 });
      await expect
        .element(page.getByTestId("swatch-#333"))
        .toHaveStyle({ backgroundColor: "rgb(51, 51, 51)" });
    });

    it("calls onClick when selected", async () => {
      const onClick = vi.fn();
      await renderSwatch({ onClick });
      await page.getByTestId("swatch-#333").click();
      expect(onClick).toHaveBeenCalled();
    });

    it("calls onDialogClosed when selected", async () => {
      const onDialogClosed = vi.fn();
      await renderSwatch({ onDialogClosed });
      await page.getByTestId("swatch-#333").click();
      expect(onDialogClosed).toHaveBeenCalled();
    });

    it("marks an active swatch", async () => {
      await renderSwatch({ active: true });
      await expect
        .element(page.getByTestId("swatch-#333"))
        .toHaveClass("saltColorChooserSwatch-active");
    });
  });
});
