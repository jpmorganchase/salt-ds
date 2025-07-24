import { Button, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { ChangeEvent } from "react";
import { type ColorResult, SketchPicker } from "react-color";
import { Color, type RGBAValue } from "./Color";
import { hexValueWithoutAlpha } from "./ColorHelpers";
import colorPickerCss from "./ColorPicker.css";
import { HexInput } from "./HexInput";
import { RGBAInput } from "./RGBAInput";

const withBaseName = makePrefixer("saltColorChooserPicker");

export interface ColorPickerProps {
  disableAlphaChooser: boolean;
  color?: Color;
  alpha?: number;
  onChange: (
    color: Color | undefined,
    finalSelection: boolean,
    e?: ChangeEvent,
  ) => void;
  onDialogClosed: () => void;
}

export const ColorPicker = ({
  alpha = 1,
  disableAlphaChooser,
  color,
  onChange,
  onDialogClosed,
}: ColorPickerProps): JSX.Element => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-color-picker",
    css: colorPickerCss,
    window: targetWindow,
  });

  const rgbaValue: RGBAValue =
    color?.rgba ?? Color.makeColorFromRGB(0, 0, 0, alpha).rgba;
  const rgbaText = disableAlphaChooser ? "RGB" : "RGBA";

  const onSubmitHex = (hexValue?: string, e?: ChangeEvent): void => {
    const newColor = Color.makeColorFromHex(hexValue);
    onChange(newColor, false, e);
  };

  const onSubmitRgb = (rgba: RGBAValue, e?: ChangeEvent): void => {
    const newColor = Color.makeColorFromRGB(rgba.r, rgba.g, rgba.b, rgba.a);
    onChange(newColor, false, e);
  };

  const onSubmitAlpha = (alpha: number, e?: ChangeEvent): void => {
    const newColor = Color.makeColorFromRGB(
      rgbaValue.r,
      rgbaValue.g,
      rgbaValue.b,
      Math.max(0, Math.min(alpha, 1)),
    );
    onChange(newColor, false, e);
  };

  const onSketchPickerChange = (
    colorResult: ColorResult,
    e: ChangeEvent,
  ): void => {
    const newColor = Color.makeColorFromRGB(
      colorResult.rgb.r,
      colorResult.rgb.g,
      colorResult.rgb.b,
      colorResult.rgb.a ?? alpha,
    );
    onChange(newColor, false, e);
  };

  const onApply = (): void => {
    onChange(color, true);
    onDialogClosed();
  };

  return (
    <div data-testid="color-picker" className={clsx(withBaseName())}>
      {/** @ts-ignore react-color has incorrect types **/}
      <SketchPicker
        className={clsx(withBaseName("swatchPickerStyles"), {
          [withBaseName("rootDisabledAlpha")]: disableAlphaChooser,
          [withBaseName("root")]: !disableAlphaChooser,
        })}
        color={rgbaValue}
        onChange={onSketchPickerChange}
        presetColors={[]}
        disableAlpha={disableAlphaChooser}
      />
      <div className={clsx(withBaseName("inputContainer"))}>
        <div className={clsx(withBaseName("inputDivs"))}>
          <span className={clsx(withBaseName("textDivOverrides"))}>HEX</span>
          <HexInput
            hexValue={
              disableAlphaChooser
                ? hexValueWithoutAlpha(color?.hex)
                : color?.hex
            }
            disableAlphaChooser={disableAlphaChooser}
            onSubmit={onSubmitHex}
          />
          <RGBAInput
            disableAlphaChooser={disableAlphaChooser}
            rgbaText={rgbaText}
            rgbaValue={rgbaValue}
            onSubmitAlpha={onSubmitAlpha}
            onSubmitRgb={onSubmitRgb}
          />
        </div>
        <div className={clsx(withBaseName("applyButtonDiv"))}>
          <Button data-testid="apply-button" variant="cta" onClick={onApply}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
