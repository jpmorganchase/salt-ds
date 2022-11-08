import {
  Color,
  ColorChooser,
  getColorPalettes,
  SwatchesPicker,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Lab/ColorChooser/QA",
  component: ColorChooser,
} as ComponentMeta<typeof ColorChooser>;

const allColors = getColorPalettes();
export const SwatchesPickerQA: ComponentStory<typeof SwatchesPicker> = () => {
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
