import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  useEffect,
  useState,
} from "react";
import { InputLegacy as Input } from "../input-legacy";

import rgbaInputCss from "./RGBAInput.css";

const withBaseName = makePrefixer("saltColorChooser");

interface AlphaInputProps {
  alphaValue: number;
  showAsOpacity?: boolean;
  onSubmit: (alpha: number, e?: ChangeEvent) => void;
}

export const AlphaInput = ({
  alphaValue,
  onSubmit,
  showAsOpacity = false,
}: AlphaInputProps): JSX.Element => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-rgba-input",
    css: rgbaInputCss,
    window: targetWindow,
  });

  const [alphaInputValue, setAlphaInputValue] = useState<string>(
    !Number.isNaN(alphaValue) ? alphaValue.toString() : "",
  );

  useEffect(() => {
    setAlphaInputValue(!Number.isNaN(alphaValue) ? alphaValue.toString() : "");
  }, [alphaValue]);

  const handleAlphaInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    newValue: string,
  ): void => {
    const value = newValue.replace("%", "");
    let alpha: string = value;

    if (value.trim() === "" || Number.isNaN(value)) {
      alpha = "";
    }

    if (showAsOpacity && Number.parseFloat(value)) {
      alpha = (Number.parseFloat(value) / 100).toString();
    }

    if (value.charAt(1) === "." || value.charAt(0) === ".") {
      alpha = value;
    }

    setAlphaInputValue(alpha);
  };

  const handleKeyDownAlpha = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      const alpha =
        alphaInputValue.trim().replace("%", "") !== ""
          ? Number.parseFloat(alphaInputValue)
          : 0;
      const validatedAlpha = Math.max(0, Math.min(alpha, 1));
      setAlphaInputValue(validatedAlpha.toString());
      onSubmit(validatedAlpha);
    }
  };

  const handleOnBlurAlpha = (e: FocusEvent<HTMLInputElement>): void => {
    // Guard against parseFloat('') becoming NaN
    const alpha =
      alphaInputValue.trim() !== "" ? Number.parseFloat(alphaInputValue) : 0;

    const validatedAlpha = Math.max(0, Math.min(alpha, 1));
    setAlphaInputValue(validatedAlpha.toString());
    onSubmit(validatedAlpha, e);
  };

  return (
    <Input
      inputProps={{
        // @ts-expect-error
        "data-testid": "a-input",
      }}
      className={clsx({
        [withBaseName("rgbaInput")]: !showAsOpacity,
        [withBaseName("opacityInput")]: showAsOpacity,
      })}
      value={
        showAsOpacity
          ? alphaInputValue
            ? `${(Number.parseFloat(alphaInputValue) * 100).toString()}%`
            : "%"
          : alphaInputValue
      }
      onChange={handleAlphaInputChange}
      onBlur={handleOnBlurAlpha}
      onKeyDown={handleKeyDownAlpha}
    />
  );
};
