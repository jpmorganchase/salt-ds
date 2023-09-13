import { render, fireEvent } from "@testing-library/react";
import {
  ColorChooser,
  Color,
  convertColorMapValueToHex,
  getColorPalettes,
  saltColorMap,
} from "../../color-chooser";

HTMLCanvasElement.prototype.getContext = jest.fn();

describe("ColorChooser", () => {
  const selectSpy = jest.fn();
  const clearSpy = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const saltColor = Color.makeColorFromHex("#D1F4C9");
  const customColor = Color.makeColorFromHex("#30BC67");
  it("Renders an overlay", () => {
    const element = render(
      <ColorChooser color={saltColor} onSelect={selectSpy} onClear={clearSpy} />
    );
    expect(
      element.getByTestId("color-chooser-overlay-button")
    ).toBeInTheDocument();
  });

  it("Renders the SwatchesPicker upon clicking on the Swatches tab", () => {
    const element = render(
      <ColorChooser color={saltColor} onSelect={selectSpy} onClear={clearSpy} />
    );
    const colorChooserOverlayButton = element.getByTestId(
      "color-chooser-overlay-button"
    );
    fireEvent.click(colorChooserOverlayButton);
    const colorLibrary = element.getByText("Swatches");
    fireEvent.click(colorLibrary);
    expect(element.getByTestId("swatches")).toBeInTheDocument();
    expect(element.getByTestId("swatches-picker")).toBeInTheDocument();
  });

  it("Selects the Swatches tab as default if no color is selected", () => {
    const element = render(
      <ColorChooser color={undefined} onSelect={selectSpy} onClear={clearSpy} />
    );
    const colorChooserOverlayButton = element.getByTestId(
      "color-chooser-overlay-button"
    );
    fireEvent.click(colorChooserOverlayButton);

    expect(element.queryByRole("tab", { name: "Swatches" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(element.queryByTestId("swatches")).toBeInTheDocument();
  });

  it("Renders the Swatches tab with defaultAlpha if nothing is selected", () => {
    const element = render(
      <ColorChooser
        color={undefined}
        onSelect={selectSpy}
        defaultAlpha={0.1}
        onClear={clearSpy}
      />
    );
    const colorChooserOverlayButton = element.getByTestId(
      "color-chooser-overlay-button"
    );
    fireEvent.click(colorChooserOverlayButton);
    expect(element.queryByTestId("swatches")).toBeInTheDocument();
    const swatch = element.getByTestId(
      `swatch-${convertColorMapValueToHex(saltColorMap.saltblue10)}`
    );
    expect(swatch.style.backgroundColor).toEqual("rgba(203, 231, 249, 0.102)");
  });

  it("Renders the Swatches tab first if a Salt color is selected", () => {
    const element = render(
      <ColorChooser color={saltColor} onSelect={selectSpy} onClear={clearSpy} />
    );
    const colorChooserOverlayButton = element.getByTestId(
      "color-chooser-overlay-button"
    );
    fireEvent.click(colorChooserOverlayButton);
    expect(element.queryByRole("tab", { name: "Swatches" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(element.queryByTestId("swatches-picker")).toBeInTheDocument();
  });

  it("Renders the Color Picker tab first if a non Salt color is selected", () => {
    const element = render(
      <ColorChooser
        color={customColor}
        onSelect={selectSpy}
        onClear={clearSpy}
      />
    );
    const colorChooserOverlayButton = element.getByTestId(
      "color-chooser-overlay-button"
    );
    fireEvent.click(colorChooserOverlayButton);
    expect(
      element.queryByRole("tab", { name: "Color Picker" })
    ).toHaveAttribute("aria-selected", "true");
    expect(element.queryByTestId("color-picker")).toBeInTheDocument();
  });

  it("Renders the Color Picker tab correctly if a non Salt color is selected and showSwatches is false", () => {
    const element = render(
      <ColorChooser
        color={customColor}
        showSwatches={false}
        onSelect={selectSpy}
        onClear={clearSpy}
      />
    );
    const colorChooserOverlayButton = element.getByTestId(
      "color-chooser-overlay-button"
    );
    fireEvent.click(colorChooserOverlayButton);
    expect(
      element.queryByRole("tab", { name: "Color Picker" })
    ).toHaveAttribute("aria-selected", "true");
    expect(element.queryByTestId("color-picker")).toBeInTheDocument();
  });

  it("Renders the ColorPicker only if the showColorPicker prop is true and colorLibrary is false", () => {
    const element = render(
      <ColorChooser
        color={saltColor}
        showColorPicker={true}
        showSwatches={false}
        onSelect={selectSpy}
        onClear={clearSpy}
      />
    );
    const colorChooserOverlayButton = element.getByTestId(
      "color-chooser-overlay-button"
    );
    fireEvent.click(colorChooserOverlayButton);
    expect(
      element.queryByRole("tab", { name: "Color Picker" })
    ).toHaveAttribute("aria-selected", "true");
    expect(element.queryByText("Color Picker")).toBeInTheDocument();
  });

  it("Throws an error if both showSwatches and showColorPicker are false", () => {
    expect(() =>
      render(
        <ColorChooser
          color={saltColor}
          showSwatches={false}
          showColorPicker={false}
          onSelect={selectSpy}
          onClear={clearSpy}
        />
      )
    ).toThrowError();
  });

  it("When color is undefined and no placeholder text is supplied displays `no color selected`", async () => {
    const { getByTestId } = render(
      <ColorChooser
        color={undefined}
        disableAlphaChooser={true}
        onSelect={selectSpy}
        onClear={clearSpy}
      />
    );
    let colorChooserOverlayButton = getByTestId("color-chooser-overlay-button");
    expect(colorChooserOverlayButton).toHaveTextContent("No color selected");
  });

  it("onClearMock is called after Default button is pressed with undefined value", async () => {
    const { getByTestId, getByText } = render(
      <ColorChooser
        color={saltColor}
        defaultAlpha={0.1}
        onSelect={selectSpy}
        onClear={clearSpy}
      />
    );
    let colorChooserOverlayButton = getByTestId("color-chooser-overlay-button");
    fireEvent.click(colorChooserOverlayButton);
    const colorLibrary = getByText("Swatches");
    fireEvent.click(colorLibrary);
    const defaultButton = getByTestId("default-button");
    fireEvent.click(defaultButton);
    expect(clearSpy).toHaveBeenCalled();
  });

  it("Sets hex inputs and rgb value inputs correctly when Default button is pressed with null value from within the Color Picker tab", async () => {
    const { getByTestId, getByText } = render(
      <ColorChooser
        color={saltColor}
        disableAlphaChooser={false}
        onSelect={selectSpy}
        onClear={clearSpy}
      />
    );
    let colorChooserOverlayButton = getByTestId("color-chooser-overlay-button");
    fireEvent.click(colorChooserOverlayButton);
    let colorPicker = getByText("Color Picker");
    fireEvent.click(colorPicker);
    const defaultButton = getByTestId("default-button");
    fireEvent.click(defaultButton);
    expect(clearSpy).toHaveBeenCalled();
  });

  it("Sets alpha back to defaultAlpha after Default button is pressed with a null color value from within the Color Picker tab", async () => {
    let selectedColor;
    const onSelectMock = (
      color: Color | undefined,
      finalSelection: boolean
    ) => {
      selectedColor = color;
    };
    const onClearMock = () => {
      selectedColor = null;
    };
    const { getByTestId, getByText, queryAllByRole, rerender } = render(
      <ColorChooser
        color={saltColor}
        onSelect={onSelectMock}
        onClear={onClearMock}
        defaultAlpha={0.65}
      />
    );
    let colorChooserOverlayButton = getByTestId("color-chooser-overlay-button");
    fireEvent.click(colorChooserOverlayButton);
    const colorLibrary = getByText("Color Picker");
    fireEvent.click(colorLibrary);
    const defaultButton = getByTestId("default-button");
    fireEvent.click(defaultButton);

    rerender(
      <ColorChooser
        color={selectedColor}
        onSelect={onSelectMock}
        onClear={onClearMock}
        defaultAlpha={0.65}
      />
    );
    colorChooserOverlayButton = getByTestId("color-chooser-overlay-button");
    expect(colorChooserOverlayButton).toHaveTextContent("No color selected");
    expect(queryAllByRole("textbox")[6]).toHaveValue("0");
    expect(queryAllByRole("textbox")[7]).toHaveValue("0");
    expect(queryAllByRole("textbox")[8]).toHaveValue("0");
    expect(queryAllByRole("textbox")[9]).toHaveValue("0.65");
  });

  it("Sets alpha to defaultAlpha on the color picker panel after Default button is pressed with null color", async () => {
    let selectedColor;
    const onSelectMock = (
      color: Color | undefined,
      finalSelection: boolean
    ) => {
      selectedColor = color;
    };
    const onClearMock = () => {
      selectedColor = null;
    };
    const { getByTestId, getByText, getByRole, queryAllByRole, rerender } =
      render(
        <ColorChooser
          color={saltColor}
          defaultAlpha={0.1}
          onSelect={onSelectMock}
          onClear={onClearMock}
        />
      );
    let colorChooserOverlayButton = getByTestId("color-chooser-overlay-button");
    fireEvent.click(colorChooserOverlayButton);
    const colorLibrary = getByText("Swatches");
    fireEvent.click(colorLibrary);
    const defaultButton = getByTestId("default-button");
    fireEvent.click(defaultButton);
    rerender(
      <ColorChooser
        color={selectedColor}
        defaultAlpha={0.1}
        onSelect={onSelectMock}
        onClear={onClearMock}
      />
    );
    colorChooserOverlayButton = getByTestId("color-chooser-overlay-button");
    expect(colorChooserOverlayButton).toHaveTextContent("No color selected");
    fireEvent.click(colorChooserOverlayButton);
    const colorPicker = getByText("Color Picker");
    fireEvent.click(colorPicker);
    expect(queryAllByRole("textbox")[4]).toHaveValue("10");
  });

  it("Renders the ColorLibrary only if the showSwatches prop is true and showColorPicker is false", () => {
    const element = render(
      <ColorChooser
        color={saltColor}
        showColorPicker={false}
        showSwatches={true}
        onSelect={selectSpy}
        onClear={clearSpy}
      />
    );
    const colorChooserOverlayButton = element.getByTestId(
      "color-chooser-overlay-button"
    );
    fireEvent.click(colorChooserOverlayButton);
    expect(element.queryByText("Swatches")).toBeInTheDocument();
    expect(element.queryByText("Color Picker")).not.toBeInTheDocument();
  });

  it("Renders the SwatchesPicker with Swatches created from Salt colours", async () => {
    const element = render(
      <ColorChooser color={saltColor} onSelect={selectSpy} onClear={clearSpy} />
    );
    const colorChooserOverlayButton = element.getByTestId(
      "color-chooser-overlay-button"
    );
    fireEvent.click(colorChooserOverlayButton);
    const swatchesPicker = element.getByText("Swatches");
    fireEvent.click(swatchesPicker);
    await expect(element.getByTestId("swatches-picker")).toBeDefined();
    for (const colorPalette of getColorPalettes()) {
      for (const color of colorPalette) {
        expect(
          element.getByTestId(`swatch-${convertColorMapValueToHex(color)}`)
        ).toBeDefined();
      }
    }
  });

  it("If prop color is a part of Salt's Swatches, it displays the name on the overlay", () => {
    const element = render(
      <ColorChooser color={saltColor} onSelect={selectSpy} onClear={clearSpy} />
    );
    expect(element.queryByText("Green10")).toBeInTheDocument();
  });

  it("If prop color is not a part of Salt's Swatches, it displays the hex value on the overlay", () => {
    const element = render(
      <ColorChooser
        color={Color.makeColorFromHex("#D1F4C1")}
        disableAlphaChooser={true}
        onSelect={selectSpy}
        onClear={clearSpy}
      />
    );
    expect(element.queryByText("#D1F4C1")).toBeInTheDocument();
  });

  it("When an rgb value with an alpha channel is given it renders the hex value and alpha value correctly in the Color Picker tab", async () => {
    const color = Color.makeColorFromRGB(209, 244, 201, 0.1);
    const element = render(
      <ColorChooser
        onSelect={selectSpy}
        color={color}
        disableAlphaChooser={false}
        onClear={clearSpy}
      />
    );
    const colorChooserOverlayButton = element.getByTestId(
      "color-chooser-overlay-button"
    );
    fireEvent.click(colorChooserOverlayButton);
    const colorPicker = element.getByText("Color Picker");
    fireEvent.click(colorPicker);
    expect(element.queryByTestId("color-picker")).toBeInTheDocument();
    expect(element.queryAllByRole("textbox")[1]).toHaveValue("209");
    expect(element.queryAllByRole("textbox")[2]).toHaveValue("244");
    expect(element.queryAllByRole("textbox")[3]).toHaveValue("201");
    expect(element.queryAllByRole("textbox")[4]).toHaveValue("10");
    expect(element.queryAllByRole("textbox")[5]).toHaveValue("D1F4C91A");
  });

  it("ColorPicker should round alpha inputs to 2 decimal places", async () => {
    const color = Color.makeColorFromRGB(209, 244, 201, 0.748738912);
    const element = render(
      <ColorChooser
        color={color}
        onSelect={selectSpy}
        disableAlphaChooser={false}
        onClear={clearSpy}
      />
    );
    const colorChooserOverlayButton = element.getByTestId(
      "color-chooser-overlay-button"
    );
    fireEvent.click(colorChooserOverlayButton);
    const colorPicker = element.getByText("Color Picker");
    fireEvent.click(colorPicker);
    const alphaInput = element.getAllByDisplayValue("0.75")[0];
    expect(alphaInput).toBeInTheDocument();
  });

  // This won't work until onBackDropClick is resolved
  // it("Does not save the chosen color if Apply is not clicked and the user clicks outside of the Overlay", () => {
  //   const element = render(
  //     <ColorChooser
  //       color={saltColor}
  //       onSelect={selectSpy}
  //       disableAlphaChooser={false}
  //       onClear={clearSpy}
  //     />
  //   );
  //   const colorChooserOverlayButton = element.getByTestId(
  //     "color-chooser-overlay-button"
  //   );
  //   fireEvent.click(colorChooserOverlayButton);
  //   const colorPicker = element.getByText("Color Picker");
  //   fireEvent.click(colorPicker);
  //   const rgbaInput = element.getAllByDisplayValue("209")[0];
  //   fireEvent.change(rgbaInput, { target: { value: "24" } });
  //   fireEvent.keyDown(rgbaInput, { key: "Enter", code: "Enter" });
  //   fireEvent.click(element.getByTestId("color-chooser-overlay").firstChild);
  //   expect(selectSpy).toHaveBeenLastCalledWith({
  //     color: expect.objectContaining({ _a: 1, _b: 201, _r: 209, _g: 244 }),
  //   });
  // });

  it("Does not dismiss the overlay if Color Picker tab is selected and Default is pressed", () => {
    const element = render(
      <ColorChooser
        color={saltColor}
        onSelect={selectSpy}
        disableAlphaChooser={false}
        onClear={clearSpy}
      />
    );
    const colorChooserOverlayButton = element.getByTestId(
      "color-chooser-overlay-button"
    );
    fireEvent.click(colorChooserOverlayButton);
    const colorPicker = element.getByText("Color Picker");
    fireEvent.click(colorPicker);
    const defaultButton = element.getByTestId("default-button");
    fireEvent.click(defaultButton);
    expect(clearSpy).toHaveBeenCalled();
    expect(element.getByTestId("color-picker")).toBeInTheDocument();
  });

  it("Does not dismiss the overlay if there is no Swatches tab and Color Picker tab is selected and Default is pressed", () => {
    const element = render(
      <ColorChooser
        color={saltColor}
        onSelect={selectSpy}
        showSwatches={false}
        disableAlphaChooser={false}
        onClear={clearSpy}
      />
    );
    const colorChooserOverlayButton = element.getByTestId(
      "color-chooser-overlay-button"
    );
    fireEvent.click(colorChooserOverlayButton);
    const defaultButton = element.getByTestId("default-button");
    fireEvent.click(defaultButton);
    expect(clearSpy).toHaveBeenCalled();
    expect(element.getByTestId("color-picker")).toBeInTheDocument();
  });
});
