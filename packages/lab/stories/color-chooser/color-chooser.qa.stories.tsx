import {
  Color,
  ColorChooser,
  getColorPalettes,
  SwatchesPicker,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Lab/Color Chooser/QA",
  component: ColorChooser,
} as Meta<typeof ColorChooser>;

const allColors = getColorPalettes();
export const SwatchesPickerQA: StoryFn<typeof SwatchesPicker> = () => {
  const [color, setColor] = useState(Color.makeColorFromHex(allColors[7][4]));
  return (
    <SwatchesPicker
      color={color}
      allColors={allColors}
      onChange={(c) => setColor(c)}
      onDialogClosed={() => {
        console.log("onDialogClosed");
      }}
    />
  );
};
