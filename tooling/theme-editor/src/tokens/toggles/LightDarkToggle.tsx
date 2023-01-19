import { ReactElement, useCallback, useState } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "@salt-ds/lab";
import { ThemeMode } from "../../header/ScopeSelector";
import "./LightDarkToggle.css";

const withBaseName = makePrefixer("saltThemeEditorModeSelector");

export const LightDarkToggle = (props: {
  mode: ThemeMode;
  onModeChanged: (mode: ThemeMode) => void;
}): ReactElement => {
  const [selectedIndex, setSelectedIndex] = useState(
    props.mode === ThemeMode.LIGHT ? 0 : 1
  );

  const onModeChanged: ToggleButtonGroupChangeEventHandler = useCallback(
    (e, index) => {
      const mode = index === 0 ? ThemeMode.LIGHT : ThemeMode.DARK;
      props.onModeChanged(mode);
      setSelectedIndex(index);
    },
    []
  );

  return (
    <div className={clsx(withBaseName())}>
      <ToggleButtonGroup onChange={onModeChanged} selectedIndex={selectedIndex}>
        <ToggleButton>Light</ToggleButton>
        <ToggleButton>Dark</ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};
