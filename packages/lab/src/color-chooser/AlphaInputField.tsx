import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  useState,
  useEffect,
} from "react";
import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { Input } from "../input";

import "./RGBAInput.css";

const withBaseName = makePrefixer("uitkColorChooser");

interface AlphaInputProps {
  "aria-label"?: string;
  alphaValue: number;
  showAsOpacity?: boolean;
  onSubmit: (alpha: number, e?: ChangeEvent) => void;
}

export const AlphaInput = ({
  alphaValue,
  "aria-label": ariaLabel,
  onSubmit,
  showAsOpacity = false,
}: AlphaInputProps): JSX.Element => {
  const [alphaInputValue, setAlphaInputValue] = useState<string>(
    !isNaN(alphaValue) ? alphaValue.toString() : ""
  );

  useEffect(() => {
    setAlphaInputValue(!isNaN(alphaValue) ? alphaValue.toString() : "");
  }, [alphaValue]);

  const handleAlphaInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    value: string
  ): void => {
    value = value.replace("%", "");
    let alpha: string = value;

    if (value.trim() === "" || Number.isNaN(value)) {
      alpha = "";
    }

    if (showAsOpacity && Number.parseFloat(value)) {
      alpha = (parseFloat(value) / 100).toString();
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
          ? parseFloat(alphaInputValue)
          : 0;
      const validatedAlpha = Math.max(0, Math.min(alpha, 1));
      setAlphaInputValue(validatedAlpha.toString());
      onSubmit(validatedAlpha);
    }
  };

  const handleOnBlurAlpha = (e: FocusEvent<HTMLInputElement>): void => {
    // Guard against parseFloat('') becoming NaN
    const alpha =
      alphaInputValue.trim() !== "" ? parseFloat(alphaInputValue) : 0;

    const validatedAlpha = Math.max(0, Math.min(alpha, 1));
    setAlphaInputValue(validatedAlpha.toString());
    onSubmit(validatedAlpha, e);
  };

  return (
    <Input
      inputProps={{
        // @ts-ignore
        "aria-label": ariaLabel,
      }}
      className={cn({
        [withBaseName("rgbaInput")]: !showAsOpacity,
        [withBaseName("opacityInput")]: showAsOpacity,
      })}
      value={
        showAsOpacity
          ? alphaInputValue
            ? (parseFloat(alphaInputValue) * 100).toString() + "%"
            : "%"
          : alphaInputValue
      }
      onChange={handleAlphaInputChange}
      onBlur={handleOnBlurAlpha}
      onKeyDown={handleKeyDownAlpha}
    />
  );
};
