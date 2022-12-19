import { useState } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "@salt-ds/lab";
import { StackLayout, Text } from "@salt-ds/core";

export const useAgGridThemeSwitcher = () => {
  const [themeName, setThemeName] = useState("salt");

  return {
    switcher: <AgGridThemeSwitcher onThemeSelect={setThemeName} />,
    themeName,
  };
};

export const AgGridThemeSwitcher = ({
  onThemeSelect,
}: {
  onThemeSelect: (themeName: string) => void;
}) => {
  const [index, setIndex] = useState(0);

  const onChange: ToggleButtonGroupChangeEventHandler = (_, index) => {
    setIndex(index);
    onThemeSelect(index === 0 ? "salt" : "uitk");
  };

  return (
    <div>
      <ToggleButtonGroup onChange={onChange} selectedIndex={index}>
        <ToggleButton aria-label="primary" tooltipText="Salt">
          Salt
        </ToggleButton>
        <ToggleButton aria-label="secondary" tooltipText="UITK">
          UITK
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};
