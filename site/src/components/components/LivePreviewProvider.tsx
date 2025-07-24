import type { Density, Mode } from "@salt-ds/core";
import { createContext, type ReactNode, useContext, useState } from "react";

type Theme = "legacy" | "brand";

export type LivePreviewContextType = {
  density?: Density;
  mode?: Mode | "system";
  theme?: Theme;
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
  setMode: (mode: Mode) => void;
};

const defaultDensity: Density = "medium";
const defaultTheme: Theme = "brand";

export const LivePreviewContext = createContext<LivePreviewContextType>({
  mode: "system",
  density: defaultDensity,
  theme: defaultTheme,
  setDensity: () => {},
  setMode: () => {},
  setTheme: () => {},
});

export function LivePreviewProvider({ children }: { children: ReactNode }) {
  const [density, setDensity] = useState<Density>(defaultDensity);
  const [mode, setMode] = useState<Mode | "system">("system");
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  return (
    <LivePreviewContext.Provider
      value={{ mode, density, theme, setDensity, setMode, setTheme }}
    >
      {children}
    </LivePreviewContext.Provider>
  );
}

export const useLivePreviewControls = (): LivePreviewContextType => {
  return useContext(LivePreviewContext);
};
