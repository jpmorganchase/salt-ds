import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import type { ChangeEvent } from "react";
import type { Color } from "./Color";
import { convertColorMapValueToHex } from "./ColorHelpers";
import { isTransparent } from "./color-utils";
import { Swatch } from "./Swatch";

import swatchCSS from "./Swatch.css";

interface SwatchesPickerProps {
  allColors: string[][];
  color: Color | undefined;
  alpha?: number;
  onChange: (
    color: Color | undefined,
    finalSelection: boolean,
    e?: ChangeEvent,
  ) => void;
  onDialogClosed: () => void;
}

interface SwatchesGroupProps {
  swatchGroup: string[];
  selectedColor: string | undefined;
  alpha: number;
  onClick: (
    color: Color | undefined,
    finalSelection: boolean,
    e?: ChangeEvent,
  ) => void;
  onDialogClosed: () => void;
}

const SwatchesGroup = ({
  swatchGroup,
  onClick,
  onDialogClosed,
  selectedColor,
  alpha,
}: SwatchesGroupProps): JSX.Element => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-swatches",
    css: swatchCSS,
    window: targetWindow,
  });

  const isBlackOrWhite = (color: string): boolean => {
    return (
      ((selectedColor ? selectedColor.startsWith("#000000") : false) &&
        color.toLowerCase() === "black") ||
      ((selectedColor
        ? selectedColor.toLowerCase().startsWith("#ffffff")
        : false) &&
        color.toLowerCase() === "white")
    );
  };
  const isActive = (color: string): boolean => {
    return (
      color.toLowerCase() ===
        selectedColor?.substring(0, 7).toString().toLowerCase() ||
      isBlackOrWhite(color)
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {swatchGroup
        ?.map((color) => {
          return convertColorMapValueToHex(color);
        })
        ?.map((color) => (
          <Swatch
            key={color.toString()}
            active={isActive(color)}
            color={color}
            onClick={onClick}
            onDialogClosed={onDialogClosed}
            alpha={alpha}
            transparent={isTransparent(color)}
          />
        ))}
    </div>
  );
};

export const SwatchesPicker = ({
  allColors,
  color,
  alpha = 1,
  onChange,
  onDialogClosed,
}: SwatchesPickerProps): JSX.Element => {
  return (
    <div
      data-testid="swatches-picker"
      style={{ display: "flex", flexDirection: "row" }}
    >
      {allColors?.map((swatchGroup: string[]) => (
        <SwatchesGroup
          swatchGroup={swatchGroup}
          key={swatchGroup.toString()}
          selectedColor={color?.hex}
          onClick={onChange}
          onDialogClosed={onDialogClosed}
          alpha={alpha}
        />
      ))}
    </div>
  );
};
