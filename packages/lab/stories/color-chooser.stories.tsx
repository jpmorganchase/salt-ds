import { ColorChooser, Color } from "@brandname/lab";
import { useState, useCallback } from "react";
import { customColorMap } from "./custom-color-map";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
  title: "Lab/ColorChooser",
  component: ColorChooser,
} as ComponentMeta<typeof ColorChooser>;

// # ColorChooser

// The ColorChooser component allows the user to select a specific color.

// # Usage

// Use the Color Library in order to select a color directly from the list of predefined colors or use the Color Picker by clicking and dragging your cursor inside the picker area to highlight a color on the bottom right.

// ## Just Color Library

export const JustSwatches: ComponentStory<typeof ColorChooser> = () => {
  const defaultColor = Color.makeColorFromHex("#D65513");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color, finalSelection) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(defaultColor);
  };
  return (
    <ColorChooser
      color={selectedColor}
      showSwatches={true}
      showColorPicker={false}
      onSelect={onSelect}
      onClear={onClear}
    />
  );
};

// ## Just Color Picker

export const JustColorPicker: ComponentStory<typeof ColorChooser> = () => {
  const defaultColor = Color.makeColorFromRGB(10, 40, 67);
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color, finalSelection) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(defaultColor);
  };
  return (
    <ColorChooser
      color={selectedColor}
      showSwatches={false}
      onSelect={onSelect}
      onClear={onClear}
    />
  );
};

// ## Default Color Chooser

export const DefaultColorChooser: ComponentStory<typeof ColorChooser> = () => {
  const defaultColor = Color.makeColorFromHex("#D65513");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color, finalSelection) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(defaultColor);
  };
  return (
    <ColorChooser color={selectedColor} onSelect={onSelect} onClear={onClear} />
  );
};

// ## Color Chooser With Alpha Disabled

export const ColorChooserWithAlphaDisabled: ComponentStory<
  typeof ColorChooser
> = () => {
  const defaultColor = Color.makeColorFromHex("#D1F4C9");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color, finalSelection) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(defaultColor);
  };
  return (
    <ColorChooser
      color={selectedColor}
      disableAlphaChooser={true}
      onSelect={onSelect}
      onClear={onClear}
    />
  );
};

// ## Color Picker as Default Tab if Selected Color is Not in the Swatches Library

export const ColorPickerAsDefaultTabIfSelectedColorIsNotInTheSwatchesLibrary: ComponentStory<
  typeof ColorChooser
> = () => {
  const defaultColor = Color.makeColorFromHex("#8644B1");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color, finalSelection) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(defaultColor);
  };
  return (
    <ColorChooser color={selectedColor} onSelect={onSelect} onClear={onClear} />
  );
};

// ## Color Picker With Default Alpha

export const ColorChooserWithDefaultAlpha: ComponentStory<
  typeof ColorChooser
> = () => {
  const defaultColor = Color.makeColorFromHex("#8224B1");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color, finalSelection) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(undefined);
  };
  return (
    <ColorChooser
      color={selectedColor}
      disableAlphaChooser={false}
      defaultAlpha={0.4}
      onSelect={onSelect}
      onClear={onClear}
    />
  );
};

// ## Color Chooser With Null Default Color

export const ColorChooserWithNullDefaultColor: ComponentStory<
  typeof ColorChooser
> = () => {
  const [selectedColor, setSelectedColor] = useState();
  const onSelect = useCallback(
    (color, finalSelection) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(undefined);
  };
  return (
    <ColorChooser color={selectedColor} onSelect={onSelect} onClear={onClear} />
  );
};

// ## Color Chooser With Custom Colors

export const ColorChooserWithCustomColors: ComponentStory<
  typeof ColorChooser
> = () => {
  const defaultColor = Color.makeColorFromHex("#C9AAF0");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color, finalSelection) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(undefined);
  };
  return (
    <ColorChooser
      color={selectedColor}
      UITKColorOverrides={customColorMap}
      onSelect={onSelect}
      onClear={onClear}
    />
  );
};

// ## Color Chooser Read Only

export const ColorChooserReadOnly: ComponentStory<typeof ColorChooser> = () => {
  const defaultColor = Color.makeColorFromHex("#C9AAF0");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color, finalSelection) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(undefined);
  };
  return (
    <ColorChooser
      color={selectedColor}
      onSelect={onSelect}
      onClear={onClear}
      readOnly={true}
    />
  );
};
