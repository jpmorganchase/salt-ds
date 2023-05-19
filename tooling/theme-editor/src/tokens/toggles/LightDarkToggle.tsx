import { ReactElement, SyntheticEvent, useCallback, useState } from "react";
import { makePrefixer } from "@salt-ds/core";
import { ToggleButton, ToggleButtonGroup } from "@salt-ds/lab";
import { ThemeMode } from "../../header/ScopeSelector";
import "./LightDarkToggle.css";

const withBaseName = makePrefixer("saltThemeEditorModeSelector");

export const LightDarkToggle = (props: {
  mode: ThemeMode;
  onModeChanged: (mode: ThemeMode) => void;
}): ReactElement => {
  const [selected, setSelected] = useState(props.mode);

  const onModeChanged = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const mode = event.currentTarget.value as unknown as ThemeMode;
      props.onModeChanged(mode);
      setSelected(mode);
    },
    []
  );

  return (
    <div className={withBaseName()}>
      <ToggleButtonGroup onSelectionChange={onModeChanged} selected={selected}>
        <ToggleButton value={ThemeMode.LIGHT}>Light</ToggleButton>
        <ToggleButton value={ThemeMode.DARK}>Dark</ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};
