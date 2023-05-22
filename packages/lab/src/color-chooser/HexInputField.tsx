import { useEffect, useState } from "react";
import { Input } from "../input";
import { isValidHex } from "./ColorHelpers";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import colorPickerCss from "./ColorPicker.css";

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
  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    testId: "salt-color-picker",
    css: colorPickerCss,
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
    <Input
      data-testid="hex-input"
      className={"input"}
      value={hexInputValue?.toString().replace("#", "").toUpperCase() ?? ""}
      onChange={handleHexInputChange}
      onKeyDown={handleKeyDownHex}
      onBlur={handleOnBlurHex}
    />
  );
};
