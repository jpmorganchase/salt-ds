import { SyntheticEvent, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";

export const useAgGridThemeSwitcher = (defaultTheme: string) => {
  const [themeName, setThemeName] = useState(defaultTheme);

  return {
    switcher: (
      <AgGridThemeSwitcher themeName={themeName} onThemeSelect={setThemeName} />
    ),
    themeName,
  };
};

export const AgGridThemeSwitcher = ({
  onThemeSelect,
  themeName,
}: {
  onThemeSelect: (themeName: string) => void;
  themeName: string;
}) => {
  const [theme, setTheme] = useState<string>(themeName);

  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setTheme(event.currentTarget.value);
    onThemeSelect(event.currentTarget.value);
  };

  return (
    <div>
      <ToggleButtonGroup
        aria-label="Theme Selection"
        onChange={onChange}
        value={theme}
      >
        <ToggleButton value="salt">Salt</ToggleButton>
        <ToggleButton value="uitk">UITK</ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};
