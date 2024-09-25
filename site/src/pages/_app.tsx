import {
  ImageProvider,
  LinkProvider,
  ThemeProvider,
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
import { StoreProvider, useCreateStore } from "@jpmorganchase/mosaic-store";
import { themeClassName } from "@jpmorganchase/mosaic-theme";
import { SaltProvider, useCurrentBreakpoint } from "@salt-ds/core";
import clsx from "clsx";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Open_Sans, PT_Mono } from "next/font/google";
import Head from "next/head";
import { type ReactNode, useMemo } from "react";
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

const DensityProvider = ({ children }: { children: ReactNode }) => {
  const viewport = useCurrentBreakpoint();

  const density = useMemo(
    () => (viewport === "xl" || viewport === "lg" ? "low" : "touch"),
    [viewport],
  );

  return <SaltProvider density={density}>{children}</SaltProvider>;
};

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
          themeClassName={clsx(
            themeClassName,
            ptMono.variable,
            openSans.variable,
          )}
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
