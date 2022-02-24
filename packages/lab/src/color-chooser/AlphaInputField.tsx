import { useState, useEffect } from "react";
import { makePrefixer } from "@brandname/core";
import { Input } from "../input";

import "./RGBAInput.css";

const withBaseName = makePrefixer("uitkColorChooser");

interface AlphaInputProps {
  alphaValue: number;
  onSubmit: (alpha: number, e?: React.ChangeEvent) => void;
}

export const AlphaInput = ({
  alphaValue,
  onSubmit,
}: AlphaInputProps): JSX.Element => {
  const [alphaInputValue, setAlphaInputValue] = useState<string>(
    !isNaN(alphaValue) ? alphaValue.toString() : ""
  );

  useEffect(() => {
    setAlphaInputValue(!isNaN(alphaValue) ? alphaValue.toString() : "");
  }, [alphaValue]);

  const handleAlphaInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ): void => {
    let alpha: string = value;

    if (value.trim() === "" || Number.isNaN(alpha)) {
      alpha = "";
    }

    if (value.charAt(1) === "." || value.charAt(0) === ".") {
      alpha = value;
    }
    setAlphaInputValue(alpha);
  };

  const handleKeyDownAlpha = (
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === "Enter") {
      const alpha =
        alphaInputValue.trim() !== "" ? parseFloat(alphaInputValue) : 0;
      const validatedAlpha = Math.max(0, Math.min(alpha, 1));
      setAlphaInputValue(validatedAlpha.toString());
      onSubmit(validatedAlpha);
    }
  };

  const handleOnBlurAlpha = (e: React.FocusEvent<HTMLInputElement>): void => {
    //Guard against parseFloat('') becoming NaN
    const alpha =
      alphaInputValue.trim() !== "" ? parseFloat(alphaInputValue) : 0;
    const validatedAlpha = Math.max(0, Math.min(alpha, 1));
    setAlphaInputValue(validatedAlpha.toString());
    onSubmit(validatedAlpha, e);
  };

  return (
    <Input
      data-testid="a-input"
      // classes={{ root: classes.overrideInput }}
      className={withBaseName("rgbaInput")}
      value={alphaInputValue}
      onChange={handleAlphaInputChange}
      onBlur={handleOnBlurAlpha}
      onKeyDown={handleKeyDownAlpha}
    />
  );
};
