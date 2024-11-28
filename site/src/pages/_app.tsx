import {
  ImageProvider,
  LinkProvider,
  getMarkdownComponents,
  withMarkdownSpacing,
} from "@jpmorganchase/mosaic-components";
import {
  LayoutProvider,
  layouts as mosaicLayouts,
} from "@jpmorganchase/mosaic-layouts";
import {
  BaseUrlProvider,
  Image,
  Link,
  Metadata,
} from "@jpmorganchase/mosaic-site-components";
import { Sitemap } from "@jpmorganchase/mosaic-sitemap-component";
import { useColorMode } from "@jpmorganchase/mosaic-store";
import { StoreProvider, useCreateStore } from "@jpmorganchase/mosaic-store";
import { ssrClassName } from "@jpmorganchase/mosaic-theme";
import { themeClassName } from "@jpmorganchase/mosaic-theme";
import {
  type Density,
  SaltProvider,
  SaltProviderNext,
  useCurrentBreakpoint,
} from "@salt-ds/core";
import { AdapterDateFns } from "@salt-ds/date-adapters";
import { LocalizationProvider } from "@salt-ds/lab";
import clsx from "clsx";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Open_Sans, PT_Mono } from "next/font/google";
import localFont from "next/font/local";
import Head from "next/head";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as saltComponents from "../components";
import * as saltLayouts from "../layouts";
import type { MyAppProps } from "../types/mosaic";
import Homepage from "./index";

import "@jpmorganchase/mosaic-components/index.css";
import "@jpmorganchase/mosaic-content-editor-plugin/index.css";
import "@jpmorganchase/mosaic-labs-components/index.css";
import "@jpmorganchase/mosaic-layouts/index.css";
import "@jpmorganchase/mosaic-site-components/index.css";
import "@jpmorganchase/mosaic-sitemap-component/index.css";
import "@jpmorganchase/mosaic-theme/baseline.css";
import "@jpmorganchase/mosaic-theme/index.css";
import "@salt-ds/theme/css/theme-next.css";
import "@salt-ds/theme/index.css";
import "prismjs/themes/prism.css";

import "../css/index.css";

const components = {
  ...getMarkdownComponents(),
  ...saltComponents,
  Homepage,
  Image,
  img: withMarkdownSpacing(Image),
  Sitemap,
};

const layoutComponents = { ...mosaicLayouts, ...saltLayouts };

const colorMode: "light" | "dark" = "dark";

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
  className?: string;
  children?: ReactNode;
  /** Enables Salt theme next */
  themeNext?: boolean;
}

/** This has to be within a SaltProvider to get correct breakpoint, not the same level as SaltProvider */
function DensitySetter({
  setDensity,
}: {
  setDensity: Dispatch<SetStateAction<Density>>;
}) {
  const viewport = useCurrentBreakpoint();

  const densityMemo = useMemo(
    () => (viewport === "xl" || viewport === "lg" ? "low" : "touch"),
    [viewport],
  );

  useEffect(() => {
    setDensity(densityMemo);
  }, [densityMemo, setDensity]);

  return null;
}

// This is a direct copy of Mosaic's ThemeProvider + injecting density, so that we can control top level provider's density,
// which impacts both children as well as portal (e.g. mobile menu drawer)
function ThemeProvider({
  themeClassName,
  className,
  themeNext,
  children,
}: ThemeProviderProps) {
  const hasHydrated = useHasHydrated();
  const colorMode = useColorMode();

  const [density, setDensity] = useState<Density>("low");

  const ssrClassname = hasHydrated ? undefined : ssrClassName;

  const ChosenSaltProvider = themeNext ? SaltProviderNext : SaltProvider;

  return (
    <ChosenSaltProvider
      mode={hasHydrated ? colorMode : "light"}
      theme={themeClassName}
      density={density}
    >
      <DensitySetter setDensity={setDensity} />
      <div className={clsx(ssrClassname, className)}>
        {children}
        <div data-mosaic-id="portal-root" />
      </div>
    </ChosenSaltProvider>
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
    <SessionProvider>
      <StoreProvider value={createStore()}>
        <Metadata Component={Head} />
        <LocalizationProvider DateAdapter={AdapterDateFns}>
          <ThemeProvider
            themeClassName={clsx(
              themeClassName,
              ptMono.variable,
              openSans.variable,
              amplitude.variable,
            )}
          >
            <BaseUrlProvider>
              <ImageProvider value={Image}>
                <LinkProvider value={Link}>
                  <LayoutProvider layoutComponents={layoutComponents}>
                    <Component components={components} {...pageProps} />
                  </LayoutProvider>
                </LinkProvider>
              </ImageProvider>
            </BaseUrlProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </StoreProvider>
    </SessionProvider>
  );
}
