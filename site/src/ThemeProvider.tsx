import { useColorMode } from "@jpmorganchase/mosaic-store";
import { type Density, SaltProviderNext } from "@salt-ds/core";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
} from "react";
import { useIsMobileView } from "./utils/useIsMobileView";

interface ThemeProviderProps {
  /** Applies to `SaltProvider` `theme` prop */
  themeClassName?: string;
  children?: ReactNode;
}

/** This has to be within a SaltProvider to get correct breakpoint, not the same level as SaltProvider */
function DensitySetter({
  setDensity,
}: {
  setDensity: Dispatch<SetStateAction<Density>>;
}) {
  const isMobileOrTablet = useIsMobileView();

  const density = isMobileOrTablet ? "touch" : "low";

  useEffect(() => {
    setDensity(density);
  }, [density, setDensity]);

  return null;
}

// This is a direct copy of Mosaic's ThemeProvider + injecting density, so that we can control top level provider's density,
// which impacts both children as well as portal (e.g. mobile menu drawer)
export function ThemeProvider({
  themeClassName,
  children,
}: ThemeProviderProps) {
  const colorMode = useColorMode();

  return (
    <SaltProviderNext
      mode={colorMode}
      theme={themeClassName}
      density="touch"
      accent="teal"
      corner="rounded"
      actionFont="Amplitude"
      headingFont="Amplitude"
    >
      {children}
      <div data-mosaic-id="portal-root" />
    </SaltProviderNext>
  );
}
