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
import { isValidHex } from "./ColorHelpers";

import colorPickerCss from "./ColorPicker.css";

interface HexInputProps {
  hexValue: string | undefined;
  disableAlphaChooser: boolean;
  onSubmit: (hex: string | undefined, e?: ChangeEvent) => void;
}

export const HexInput = ({
  hexValue,
  disableAlphaChooser,
  onSubmit,
}: HexInputProps): JSX.Element => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-color-picker",
    css: colorPickerCss,
    window: targetWindow,
  });

  const [hexInputValue, setHexInputValue] = useState<string | undefined>(
    hexValue,
  );

  useEffect(() => {
    setHexInputValue(hexValue);
  }, [hexValue]);

  const handleHexInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    value: string,
  ): void => {
    if (disableAlphaChooser && value.length < 7) {
      setHexInputValue(`#${value}`);
    }
    if (!disableAlphaChooser) {
      setHexInputValue(`#${value}`);
    }
  };

  const handleKeyDownHex = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      isValidHex(hexInputValue) && onSubmit(hexInputValue);
    }
  };

  const handleOnBlurHex = (e: FocusEvent<HTMLInputElement>): void => {
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
