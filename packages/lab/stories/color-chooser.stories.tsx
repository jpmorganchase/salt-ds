import { SaltProvider } from "@salt-ds/core";
import { ColorChooser, Color } from "@salt-ds/lab";
import { useState, useCallback } from "react";
import { customColorMap } from "./custom-color-map";
import { StoryFn, Meta } from "@storybook/react";

export default {
  title: "Lab/Color Chooser",
  component: ColorChooser,
} as Meta<typeof ColorChooser>;

// # ColorChooser

// The ColorChooser component allows the user to select a specific color.

// # Usage

// Use the Color Library in order to select a color directly from the list of predefined colors or use the Color Picker by clicking and dragging your cursor inside the picker area to highlight a color on the bottom right.

export const Default: StoryFn<typeof ColorChooser> = () => {
  const defaultColor = Color.makeColorFromHex("#D65513");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color?: Color) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(defaultColor);
  };
  return (
    <SaltProvider density="high">
      <ColorChooser
        color={selectedColor}
        onSelect={onSelect}
        onClear={onClear}
      />
    </SaltProvider>
  );
};

// ## Color Chooser With Alpha Disabled

export const WithAlphaDisabled: StoryFn<typeof ColorChooser> = () => {
  const defaultColor = Color.makeColorFromHex("#D1F4C9");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color?: Color) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(defaultColor);
  };
  return (
    <SaltProvider density="high">
      <ColorChooser
        color={selectedColor}
        disableAlphaChooser={true}
        onSelect={onSelect}
        onClear={onClear}
      />
    </SaltProvider>
  );
};

// ## Color Picker With Default Alpha

export const WithDefaultAlpha: StoryFn<typeof ColorChooser> = () => {
  const defaultColor = Color.makeColorFromHex("#8224B1");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color?: Color) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(undefined);
  };
  return (
    <SaltProvider density="high">
      <ColorChooser
        color={selectedColor}
        disableAlphaChooser={false}
        defaultAlpha={0.4}
        onSelect={onSelect}
        onClear={onClear}
      />
    </SaltProvider>
  );
};

// ## Color Chooser With Null Default Color

export const WithNullDefaultColor: StoryFn<typeof ColorChooser> = () => {
  const [selectedColor, setSelectedColor] = useState<Color | undefined>();
  const onSelect = useCallback(
    (color?: Color) => {
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

export const WithCustomColors: StoryFn<typeof ColorChooser> = () => {
  const defaultColor = Color.makeColorFromHex("#C9AAF0");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color?: Color) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(undefined);
  };
  return (
    <SaltProvider density="high">
      <ColorChooser
        color={selectedColor}
        saltColorOverrides={customColorMap}
        onSelect={onSelect}
        onClear={onClear}
      />
    </SaltProvider>
  );
};

// ## Color Chooser Read Only

export const ReadOnly: StoryFn<typeof ColorChooser> = () => {
  const defaultColor = Color.makeColorFromHex("#C9AAF0");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color?: Color) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(undefined);
  };
  return (
    <SaltProvider density="high">
      <ColorChooser
        color={selectedColor}
        onSelect={onSelect}
        onClear={onClear}
        readOnly={true}
      />
    </SaltProvider>
  );
};

// ## Color Picker as Default Tab if Selected Color is Not in the Swatches Library

export const ColorPickerAsDefaultTabIfSelectedColorIsNotInTheSwatchesLibrary: StoryFn<
  typeof ColorChooser
> = () => {
  const defaultColor = Color.makeColorFromHex("#8644B1");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color?: Color) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(defaultColor);
  };
  return (
    <SaltProvider density="high">
      <ColorChooser
        color={selectedColor}
        onSelect={onSelect}
        onClear={onClear}
      />
    </SaltProvider>
  );
};

export const JustSwatches: StoryFn<typeof ColorChooser> = () => {
  const defaultColor = Color.makeColorFromHex("#D65513");
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const onSelect = useCallback(
    (color?: Color) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(defaultColor);
  };
  return (
    <SaltProvider density="high">
      <ColorChooser
        color={selectedColor}
        showSwatches={true}
        showColorPicker={false}
        onSelect={onSelect}
        onClear={onClear}
      />
    </SaltProvider>
  );
};

export const JustColorPicker: StoryFn<typeof ColorChooser> = () => {
  const defaultColor = Color.makeColorFromRGB(10, 40, 67);
  const [selectedColor, setSelectedColor] = useState<Color | undefined>(
    defaultColor
  );
  const onSelect = useCallback(
    (color?: Color) => {
      setSelectedColor(color);
    },
    [setSelectedColor]
  );
  const onClear = () => {
    setSelectedColor(defaultColor);
  };
  return (
    <SaltProvider density="high">
      <ColorChooser
        color={selectedColor}
        showSwatches={false}
        onSelect={onSelect}
        onClear={onClear}
      />
    </SaltProvider>
  );
};
