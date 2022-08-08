import { ChangeEvent } from "react";
import { Color } from "./Color";
import { ColorPicker } from "./ColorPicker";
import { DictTabsProps } from "./DictTabs";
import { Swatches } from "./Swatches";

interface TabsMappingProps {
  swatches: boolean;
  colorPicker: boolean;
  disableAlphaChooser: boolean;
  allColors: string[][];
  color: Color | undefined;
  alpha: number;
  handleColorChange: (
    color: Color | undefined,
    finalSelection: boolean,
    e?: ChangeEvent
  ) => void;
  displayColorName: string | undefined;
  placeholder: string | undefined;
  onDialogClosed: () => void;
}

export const createTabsMapping = ({
  swatches,
  colorPicker,
  disableAlphaChooser,
  allColors,
  color,
  alpha,
  handleColorChange,
  displayColorName,
  placeholder,
  onDialogClosed,
}: TabsMappingProps): DictTabsProps["tabs"] => {
  if (!swatches && !colorPicker) {
    throw new Error("You cannot select no color chooser tabs");
  }

  return {
    ...(swatches && {
      Swatches: {
        Component: Swatches,
        props: {
          allColors,
          color,
          alpha,
          handleColorChange,
          displayColorName,
          placeholder,
          onDialogClosed,
        },
      },
    }),
    ...(colorPicker && {
      "Color Picker": {
        Component: ColorPicker,
        props: {
          disableAlphaChooser,
          color,
          alpha,
          onChange: handleColorChange,
          onDialogClosed,
        },
      },
    }),
  };
};
