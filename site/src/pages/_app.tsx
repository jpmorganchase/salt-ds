import { useColorMode } from "@jpmorganchase/mosaic-store";
import { StoreProvider, useCreateStore } from "@jpmorganchase/mosaic-store";
import { type Density, SaltProviderNext } from "@salt-ds/core";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { LocalizationProvider } from "@salt-ds/lab";
import clsx from "clsx";
import type { AppProps } from "next/app";
import { Open_Sans, PT_Mono } from "next/font/google";
import localFont from "next/font/local";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useState,
} from "react";
import * as saltComponents from "../components";
import * as saltLayouts from "../layouts";
import { LayoutProvider } from "../layouts/LayoutProvider";
import type { MyAppProps } from "../types/mosaic";

import "@salt-ds/theme/css/theme-next.css";
import "@salt-ds/theme/index.css";

import "../css/index.css";
import { Metadata } from "../Metadata/index";
import { useIsMobileView } from "../utils/useIsMobileView";

const components = {
  ...saltComponents,
};

const layoutComponents = { ...saltLayouts };

const colorMode: "light" | "dark" = "light";

const ptMono = PT_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  // Below are not set to salt variable directly so that local serve will resolve correct CSS specificity
  variable: "--site-font-family-ptMono",
});
const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--site-font-family-openSans",
});

const amplitude = localFont({
  src: [
    {
      path: "../../public/fonts/amplitude-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/amplitude-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/amplitude-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/amplitude-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--site-font-family-amplitude",
});
const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

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
function ThemeProvider({ themeClassName, children }: ThemeProviderProps) {
  const hasHydrated = useHasHydrated();
  const colorMode = useColorMode();

  const [density, setDensity] = useState<Density>("low");

  return (
    <SaltProviderNext
      mode={hasHydrated ? colorMode : "light"}
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

export default function MyApp({
  Component,
  pageProps = {},
}: AppProps<MyAppProps>) {
  const { searchIndex, searchConfig, sharedConfig, source } = pageProps;

  const customSource = source as { frontmatter: Record<string, unknown> };
  const frontmatter = customSource?.frontmatter || {};
  // Prevents data being re-used across pages
  frontmatter.data = frontmatter.data || undefined;
  const storeProps = {
    sharedConfig,
    colorMode,
    searchIndex,
    searchConfig,
    ...frontmatter,
  };

  const createStore = useCreateStore(storeProps);

  return (
    <StoreProvider value={createStore()}>
      <Metadata />
      <LocalizationProvider DateAdapter={AdapterDateFns}>
        <ThemeProvider
          themeClassName={clsx(
            "salt-editorial",
            ptMono.variable,
            openSans.variable,
            amplitude.variable,
          )}
        >
          <LayoutProvider
            defaultLayout="DetailError"
            layoutComponents={layoutComponents}
          >
            <Component components={components} {...pageProps} />
          </LayoutProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </StoreProvider>
  );
}
