import { SyntheticEvent, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@salt-ds/lab";

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
  const [theme, setTheme] = useState("salt");

  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setTheme(event.currentTarget.value);
    onThemeSelect(event.currentTarget.value);
  };

  return (
    <div>
      <ToggleButtonGroup
        aria-label="Theme Selection"
        onSelectionChange={onChange}
        selected={theme}
      >
        <ToggleButton value="salt">Salt</ToggleButton>
        <ToggleButton value="uitk">UITK</ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};
