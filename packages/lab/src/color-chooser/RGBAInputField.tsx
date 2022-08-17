import { useState, useEffect } from "react";
import { Input, makePrefixer } from "@jpmorganchase/uitk-core";
import { RGBAValue } from "./Color";

import "./RGBAInput.css";

const withBaseName = makePrefixer("uitkColorChooser");
interface RGBInputProps {
  rgbaValue: RGBAValue;
  value: "r" | "g" | "b";
  onSubmit: (rgb: RGBAValue, e?: React.ChangeEvent) => void;
}

export const RGBInput = ({
  rgbaValue,
  value,
  onSubmit,
}: RGBInputProps): JSX.Element => {
  const [rgbaInputValue, setRgbaInputValue] = useState<number | string>(
    rgbaValue ? rgbaValue[value] : ""
  );

  useEffect(() => {
    setRgbaInputValue(rgbaValue ? rgbaValue[value] : "");
  }, [rgbaValue, value]);

  const handleRGBInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: string
  ): void => {
    let rgb: string | number;

    rgb = parseInt(value);

    if (value.trim() === "" || Number.isNaN(rgb)) {
      rgb = "";
    }

    setRgbaInputValue(rgb);
  };

  const handleKeyDownRGB = (e: React.KeyboardEvent<HTMLInputElement>): void => {
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

  const handleOnBlurRGB = (e: React.FocusEvent<HTMLInputElement>): void => {
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
        // @ts-ignore
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
