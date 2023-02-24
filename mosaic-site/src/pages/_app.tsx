// eslint-disable import/no-duplicates
import { useMemo } from "react";
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
import "@jpmorganchase/mosaic-site-preset-styles/index.css";
import "../css/index.css";
import { Mode } from "@salt-ds/theme";
import { SaltProvider, useCurrentBreakpoint } from "@salt-ds/core";
import Homepage from "./index";
import * as saltLayouts from "../layouts";

import { MyAppProps } from "../types/mosaic";

const saltComponents = { Homepage };
const components = { ...mosaicComponents, ...saltComponents };

const layoutComponents = { ...mosaicLayouts, ...saltLayouts };

const DensityProvider = ({ children }) => {
  const viewport = useCurrentBreakpoint();

  const density = useMemo(
    () => (viewport === "xl" || viewport === "lg" ? "low" : "touch"),
    [viewport]
  );

  return <SaltProvider density={density}>{children}</SaltProvider>;
};

const colorMode: Mode = "dark";

export default function MyApp({
  Component,
  pageProps = {},
}: AppProps<MyAppProps>) {
  const { searchIndex, sharedConfig, source } = pageProps;

  const customSource = source as { frontmatter: Record<string, unknown> };
  const frontmatter = customSource?.frontmatter || {};
  const storeProps = { sharedConfig, colorMode, searchIndex, ...frontmatter };
  const createStore = useCreateStore(storeProps);

  return (
    <SessionProvider>
      <StoreProvider value={createStore()}>
        <Metadata Component={Head} />
        <ThemeProvider>
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
