import type { Density, Mode } from "@salt-ds/core";
import { createContext, type ReactNode, useContext, useState } from "react";

type Theme = "legacy" | "brand" | "salt-interim";

export type LivePreviewContextType = {
  density?: Density;
  mode?: Mode | "system";
  theme?: Theme;
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
  setMode: (mode: Mode | "system") => void;
  resetToDefaults: () => void;
};

const defaultDensity: Density = "medium";
const defaultTheme: Theme = "brand";
const defaultMode = "system";

export const LivePreviewContext = createContext<LivePreviewContextType>({
  mode: defaultMode,
  density: defaultDensity,
  theme: defaultTheme,
  setDensity: () => {},
  setMode: () => {},
  setTheme: () => {},
  resetToDefaults: () => {},
});

export function LivePreviewProvider({ children }: { children: ReactNode }) {
  const [density, setDensity] = useState<Density>(defaultDensity);
  const [mode, setMode] = useState<Mode | "system">(defaultMode);
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const resetToDefaults = () => {
    setDensity(defaultDensity);
    setMode(defaultMode);
    setTheme(defaultTheme);
  };

  return (
    <LivePreviewContext.Provider
      value={{
        mode,
        density,
        theme,
        setDensity,
        setMode,
        setTheme,
        resetToDefaults,
      }}
    >
      {children}
    </LivePreviewContext.Provider>
  );
}

export const useLivePreviewControls = (): LivePreviewContextType => {
  return useContext(LivePreviewContext);
};
