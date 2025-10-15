import { useColorMode } from "@jpmorganchase/mosaic-store";
import { type Density, SaltProviderNext } from "@salt-ds/core";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useState,
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

  const density = isMobileOrTablet ? "mobile" : "low";

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

  const [density, setDensity] = useState<Density>("low");

  return (
    <SaltProviderNext
      mode={colorMode}
      theme={themeClassName}
      density={density}
      accent="teal"
      corner="rounded"
      actionFont="Amplitude"
      headingFont="Amplitude"
    >
      <DensitySetter setDensity={setDensity} />
      {children}
      <div data-mosaic-id="portal-root" />
    </SaltProviderNext>
  );
}
