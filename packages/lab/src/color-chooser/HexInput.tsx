import { useState, useEffect } from "react";
import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { Input } from "../input";
import { isValidHex } from "./ColorHelpers";

import "./HexInput.css";

const withBaseName = makePrefixer("uitkColorChooserHexInput");

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
    <div className={cn(withBaseName())}>
      <span className={cn(withBaseName("hashSign"))}>#</span>
      <Input
        data-testid="hex-input"
        className={cn(withBaseName("input"))}
        value={hexInputValue?.toString().replace("#", "").toUpperCase() ?? ""}
        onChange={handleHexInputChange}
        onKeyDown={handleKeyDownHex}
        onBlur={handleOnBlurHex}
      />
    </div>
  );
};
