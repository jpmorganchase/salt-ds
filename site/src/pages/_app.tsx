// eslint-disable import/no-duplicates
import { useMemo, ReactNode } from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import {
  BaseUrlProvider,
  Image,
  Link,
  Metadata,
} from "@jpmorganchase/mosaic-site-components";
import {
  ImageProvider,
  LinkProvider,
  ThemeProvider,
} from "@jpmorganchase/mosaic-components";
import { LayoutProvider } from "@jpmorganchase/mosaic-layouts";
import { useCreateStore, StoreProvider } from "@jpmorganchase/mosaic-store";
import { components as mosaicComponents } from "@jpmorganchase/mosaic-site-components";
import { layouts as mosaicLayouts } from "@jpmorganchase/mosaic-layouts";
import { SessionProvider } from "next-auth/react";
import { themeClassName } from "@jpmorganchase/mosaic-theme";
import "@salt-ds/theme/index.css";
import "@jpmorganchase/mosaic-theme/index.css";
import "@jpmorganchase/mosaic-theme/baseline.css";
import "@jpmorganchase/mosaic-layouts/index.css";
import "@jpmorganchase/mosaic-site-components/index.css";
import "@jpmorganchase/mosaic-components/index.css";
import "@jpmorganchase/mosaic-labs-components/index.css";
import "@jpmorganchase/mosaic-content-editor-plugin/index.css";
import "prismjs/themes/prism.css";

import { SaltProvider, useCurrentBreakpoint } from "@salt-ds/core";
import { PT_Mono, Open_Sans } from "next/font/google";

import "../css/index.css";
import Homepage from "./index";
import * as saltLayouts from "../layouts";
import * as saltComponents from "../components";

import { MyAppProps } from "../types/mosaic";
import clsx from "clsx";

const components = {
  ...mosaicComponents,
  ...saltComponents,
  Homepage,
  Image,
};

const layoutComponents = { ...mosaicLayouts, ...saltLayouts };

const DensityProvider = ({ children }: { children: ReactNode }) => {
  const viewport = useCurrentBreakpoint();

  const density = useMemo(
    () => (viewport === "xl" || viewport === "lg" ? "low" : "touch"),
    [viewport]
  );

  return <SaltProvider density={density}>{children}</SaltProvider>;
};

const colorMode: "light" | "dark" = "dark";

const ptMono = PT_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--site-font-family-code",
});
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--site-font-family",
  display: "swap",
});
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
        <ThemeProvider
          className={clsx(themeClassName, ptMono.variable, openSans.variable)}
        >
          <DensityProvider>
            <BaseUrlProvider>
              <ImageProvider value={Image}>
                <LinkProvider value={Link}>
                  <LayoutProvider layoutComponents={layoutComponents}>
                    <Component components={components} {...pageProps} />
                  </LayoutProvider>
                </LinkProvider>
              </ImageProvider>
            </BaseUrlProvider>
          </DensityProvider>
        </ThemeProvider>
      </StoreProvider>
    </SessionProvider>
  );
}
