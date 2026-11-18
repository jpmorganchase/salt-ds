import {
  type LivePreviewContextType,
  useLivePreviewControls,
} from "./LivePreviewProvider";
import { type ThemeOption, ThemeSettingsOverlay } from "./ThemeSettingsOverlay";

type Theme = NonNullable<LivePreviewContextType["theme"]>;

const themeOptions: ThemeOption<Theme>[] = [
  { value: "legacy", label: "Legacy" },
  { value: "brand", label: "J.P. Morgan" },
  { value: "salt-interim", label: "J.P. Morgan (Interim)" },
];

export function ThemeControls({ scope }: { scope: "component" | "pattern" }) {
  const {
    density,
    mode,
    theme,
    setDensity,
    setMode,
    setTheme,
    resetToDefaults,
  } = useLivePreviewControls();

  return (
    <ThemeSettingsOverlay<Theme>
      scope={scope}
      density={density}
      onDensityChange={setDensity}
      mode={mode}
      onModeChange={setMode}
      theme={theme}
      themeOptions={themeOptions}
      onThemeChange={setTheme}
      onReset={resetToDefaults}
    />
  );
}
