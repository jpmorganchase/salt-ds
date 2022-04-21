import { ReactElement, useCallback, useState } from "react";
import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { ToggleButton, ToggleButtonGroup } from "@jpmorganchase/lab";
import { ThemeMode } from "../../header/ScopeSelector";
import "./LightDarkToggle.css";

const withBaseName = makePrefixer("uitkThemeEditorModeSelector");

export const LightDarkToggle = (props: {
  mode: ThemeMode;
  onModeChanged: (mode: ThemeMode) => void;
}): ReactElement => {
  const [selectedIndex, setSelectedIndex] = useState(
    props.mode === ThemeMode.LIGHT ? 0 : 1
  );

  const onModeChanged = useCallback((e, index) => {
    const mode = index === 0 ? ThemeMode.LIGHT : ThemeMode.DARK;
    props.onModeChanged(mode);
    setSelectedIndex(index);
  }, []);

  return (
    <div className={cn(withBaseName())}>
      <ToggleButtonGroup onChange={onModeChanged} selectedIndex={selectedIndex}>
        <ToggleButton>Light</ToggleButton>
        <ToggleButton>Dark</ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};
