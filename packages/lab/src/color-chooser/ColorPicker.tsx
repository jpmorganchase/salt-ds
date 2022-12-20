import { ChangeEvent } from "react";
import { SketchPicker, ColorResult } from "react-color";
import cn from "classnames";
import { Button, makePrefixer } from "@salt-ds/core";
import { Color, RGBAValue } from "./Color";
import { hexValueWithoutAlpha } from "./ColorHelpers";
import { HexInput } from "./HexInput";
import { RGBAInput } from "./RGBAInput";

import "./ColorPicker.css";

const withBaseName = makePrefixer("saltColorChooserPicker");

export interface ColorPickerProps {
  disableAlphaChooser: boolean;
  color?: Color;
  alpha?: number;
  onChange: (
    color: Color | undefined,
    finalSelection: boolean,
    e?: ChangeEvent
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
      Math.max(0, Math.min(alpha, 1))
    );
    onChange(newColor, false, e);
  };

  const onSketchPickerChange = (
    colorResult: ColorResult,
    e: ChangeEvent
  ): void => {
    const newColor = Color.makeColorFromRGB(
      colorResult.rgb.r,
      colorResult.rgb.g,
      colorResult.rgb.b,
      colorResult.rgb.a ?? alpha
    );
    onChange(newColor, false, e);
  };

  const onApply = (): void => {
    onChange(color, true);
    onDialogClosed();
  };

  return (
    <div data-testid="color-picker" className={cn(withBaseName())}>
      {/** @ts-ignore react-color has incorrect types **/}
      <SketchPicker
        className={cn(withBaseName("swatchPickerStyles"), {
          ["rootDisabledAlpha"]: disableAlphaChooser,
          ["root"]: !disableAlphaChooser,
        })}
        color={rgbaValue}
        onChange={onSketchPickerChange}
        presetColors={[]}
        disableAlpha={disableAlphaChooser}
      />
      <div className={cn(withBaseName("inputContainer"))}>
        <div className={cn(withBaseName("inputDivs"))}>
          <span className={cn(withBaseName("textDivOverrides"))}>HEX</span>
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
        <div className={cn(withBaseName("applyButtonDiv"))}>
          <Button data-testid="apply-button" variant="cta" onClick={onApply}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
