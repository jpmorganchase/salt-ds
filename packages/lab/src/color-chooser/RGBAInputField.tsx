import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  useEffect,
  useState,
} from "react";
import { InputLegacy as Input } from "../input-legacy";
import type { RGBAValue } from "./Color";
import rgbaInputCss from "./RGBAInput.css";

const withBaseName = makePrefixer("saltColorChooser");
interface RGBInputProps {
  rgbaValue: RGBAValue;
  value: "r" | "g" | "b";
  onSubmit: (rgb: RGBAValue, e?: ChangeEvent) => void;
}

export const RGBInput = ({
  rgbaValue,
  value,
  onSubmit,
}: RGBInputProps): JSX.Element => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-rgba-input",
    css: rgbaInputCss,
    window: targetWindow,
  });

  const [rgbaInputValue, setRgbaInputValue] = useState<number | string>(
    rgbaValue ? rgbaValue[value] : "",
  );

  useEffect(() => {
    setRgbaInputValue(rgbaValue ? rgbaValue[value] : "");
  }, [rgbaValue, value]);

  const handleRGBInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    value: string,
  ): void => {
    let rgb: string | number;

    rgb = Number.parseInt(value);

    if (value.trim() === "" || Number.isNaN(rgb)) {
      rgb = "";
    }

    setRgbaInputValue(rgb);
  };

  const handleKeyDownRGB = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      const newRgb = { ...rgbaValue, [value]: e.currentTarget.value };
      const validatedRgb = {
        r: Math.max(0, Math.min(newRgb.r, 255)),
        g: Math.max(0, Math.min(newRgb.g, 255)),
        b: Math.max(0, Math.min(newRgb.b, 255)),
        a: newRgb.a,
      };

      onSubmit(validatedRgb);
    }
  };

  const handleOnBlurRGB = (e: FocusEvent<HTMLInputElement>): void => {
    const newRgb = { ...rgbaValue, [value]: e.target.value };
    const validatedRgb = {
      r: Math.max(0, Math.min(newRgb.r, 255)),
      g: Math.max(0, Math.min(newRgb.g, 255)),
      b: Math.max(0, Math.min(newRgb.b, 255)),
      a: newRgb.a,
    };

    onSubmit(validatedRgb, e);
  };

  return (
    <Input
      inputProps={{
        // @ts-expect-error
        "data-testid": `${value}-input`,
      }}
      className={withBaseName("rgbaInput")}
      value={rgbaInputValue.toString()}
      onChange={handleRGBInputChange}
      onBlur={handleOnBlurRGB}
      onKeyDown={handleKeyDownRGB}
    />
  );
};
