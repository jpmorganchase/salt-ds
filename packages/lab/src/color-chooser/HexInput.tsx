import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { makePrefixer } from "@salt-ds/core";
import { isValidHex } from "./ColorHelpers";
import { InputLegacy as Input } from "../input-legacy";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import hexInputCss from "./HexInput.css";

const withBaseName = makePrefixer("saltColorChooserHexInput");

interface HexInputProps {
  hexValue: string | undefined;
  disableAlphaChooser: boolean;
  onSubmit: (hex: string | undefined, e?: React.ChangeEvent) => void;
}

export const HexInput = ({
  hexValue,
  disableAlphaChooser,
  onSubmit,
}: HexInputProps): JSX.Element => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-hex-input",
    css: hexInputCss,
    window: targetWindow,
  });

  const [hexInputValue, setHexInputValue] = useState<string | undefined>(
    hexValue
  );

  useEffect(() => {
    setHexInputValue(hexValue);
  }, [hexValue]);

  const handleHexInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ): void => {
    if (disableAlphaChooser && value.length < 7) {
      setHexInputValue("#" + value);
    }
    if (!disableAlphaChooser) {
      setHexInputValue("#" + value);
    }
  };

  const handleKeyDownHex = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      isValidHex(hexInputValue) && onSubmit(hexInputValue);
    }
  };

  const handleOnBlurHex = (e: React.FocusEvent<HTMLInputElement>): void => {
    isValidHex(hexInputValue) && onSubmit(hexInputValue, e);
  };

  return (
    <div className={clsx(withBaseName())}>
      <span className={clsx(withBaseName("hashSign"))}>#</span>
      <Input
        data-testid="hex-input"
        className={clsx(withBaseName("input"))}
        value={hexInputValue?.toString().replace("#", "").toUpperCase() ?? ""}
        onChange={handleHexInputChange}
        onKeyDown={handleKeyDownHex}
        onBlur={handleOnBlurHex}
      />
    </div>
  );
};
