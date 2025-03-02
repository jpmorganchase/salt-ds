import { useColorMode } from "@jpmorganchase/mosaic-store";
import type { Density, Mode, SaltProviderNextProps } from "@salt-ds/core";
import { type ReactNode, createContext, useContext, useState } from "react";

type Theme = "legacy" | "brand";

export type LivePreviewContextType = Pick<
  SaltProviderNextProps,
  "mode" | "density"
> & {
  theme?: Theme;
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
  setMode: (mode: Mode) => void;
};

const defaultDensity: Density = "medium";
const defaultTheme: Theme = "brand";

export const LivePreviewContext = createContext<LivePreviewContextType>({
  mode: undefined,
  density: defaultDensity,
  theme: defaultTheme,
  setDensity: () => {},
  setMode: () => {},
  setTheme: () => {},
});

export function LivePreviewProvider({ children }: { children: ReactNode }) {
  const siteMode = useColorMode();
  const [density, setDensity] = useState<Density>(defaultDensity);
  const [modeState, setMode] = useState<Mode | undefined>(undefined);
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const mode = modeState ?? siteMode;
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
