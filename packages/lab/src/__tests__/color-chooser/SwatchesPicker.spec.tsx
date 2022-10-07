import { render, fireEvent } from "@testing-library/react";
import { Swatch, SwatchesPicker, Color } from "../../color-chooser";

const changeSpy = jest.fn();
const onDialogClosedSpy = jest.fn();

const colorResult = Color.makeColorFromHex("#333333");
describe("SwatchesPicker", () => {
  it("SwatchesPicker renders correctly", () => {
    const element = render(
      <SwatchesPicker
        color={colorResult}
        allColors={[["#ffffff"], ["#333333"]]}
        onChange={changeSpy}
        onDialogClosed={onDialogClosedSpy}
      />
    );
    expect(element.getByTestId("swatches-picker")).toBeInTheDocument();
  });

  it("SwatchesPicker renders Swatches with correct alpha channel if alpha is not 1", () => {
    const element = render(
      <SwatchesPicker
        color={colorResult}
        allColors={[["#ffffff"], ["#333333"]]}
        onChange={changeSpy}
        alpha={0.1}
        onDialogClosed={onDialogClosedSpy}
      />
    );
    const swatch = element.getByTestId("swatch-#333333");
    expect(swatch.style.background).toEqual("rgba(51, 51, 51, 0.102)");
  });

  it("SwatchesPicker reacts to onChange events correctly", () => {
    const element = render(
      <SwatchesPicker
        color={colorResult}
        allColors={[["#ffffff"], ["#333333"]]}
        onChange={changeSpy}
        onDialogClosed={onDialogClosedSpy}
      />
    );
    expect(changeSpy).toHaveBeenCalledTimes(0);
    const swatch = element.getByTestId("swatch-#333333");
    fireEvent.click(swatch);
    expect(changeSpy).toHaveBeenCalledWith(
      {
        color: expect.objectContaining({ _a: 1, _b: 51, _g: 51, _r: 51 }),
      },
      true
    );
  });

  describe("Swatch", () => {
    const color = "#333";
    it("Should render a div with a colored background and an alpha channel if alpha is not 1", () => {
      const onClickSpy = jest.fn();
      const element = render(
        <Swatch
          color={color}
          onClick={onClickSpy}
          active={false}
          alpha={0.1}
          onDialogClosed={onDialogClosedSpy}
        />
      );
      const swatch = element.getByTestId("swatch-#333");
      expect(swatch.style.background).toEqual("rgba(51, 51, 51, 0.102)");
    });
    it("Should render a div with a colored background", () => {
      const onClickSpy = jest.fn();
      const element = render(
        <Swatch
          color={color}
          onClick={onClickSpy}
          active={false}
          alpha={1}
          onDialogClosed={onDialogClosedSpy}
        />
      );
      const swatch = element.getByTestId("swatch-#333");
      expect(swatch.style.background).toEqual("rgb(51, 51, 51)");
    });
    it("Should call onClick callback if selected", () => {
      const onClickSpy = jest.fn();
      const element = render(
        <Swatch
          color={color}
          onClick={onClickSpy}
          active={false}
          alpha={0.1}
          onDialogClosed={onDialogClosedSpy}
        />
      );
      fireEvent.click(element.getByTestId("swatch-#333"));
      expect(onClickSpy).toHaveBeenCalled();
    });
    it("Should call onDialogClosed callback if selected", () => {
      const onClickSpy = jest.fn();
      const element = render(
        <Swatch
          color={color}
          onClick={onClickSpy}
          active={false}
          alpha={0.1}
          onDialogClosed={onDialogClosedSpy}
        />
      );
      fireEvent.click(element.getByTestId("swatch-#333"));
      expect(onDialogClosedSpy).toHaveBeenCalled();
    });
    it("If swatch is active it should have a specific style with a border", () => {
      const onClickSpy = jest.fn();
      const element = render(
        <Swatch
          color={color}
          onClick={onClickSpy}
          active={true}
          alpha={0.1}
          onDialogClosed={onDialogClosedSpy}
        />
      );
      const swatch = element.getByTestId("swatch-#333");
      expect(swatch).toHaveClass(
        "uitkColorChooserSwatch-active uitkColorChooserSwatch-swatch"
      );
    });
  });
});
