import { StoreProvider, useCreateStore } from "@jpmorganchase/mosaic-store";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { LocalizationProvider } from "@salt-ds/lab";
import clsx from "clsx";
import type { AppProps } from "next/app";
import { Metadata } from "../Metadata/index";
import { ThemeProvider } from "../ThemeProvider";
import * as saltComponents from "../components";
import { amplitude, openSans, ptMono } from "../fonts";
import * as saltLayouts from "../layouts";
import { LayoutProvider } from "../layouts/LayoutProvider";
import type { MyAppProps } from "../types/mosaic";

import "@salt-ds/theme/index.css";
import "@salt-ds/theme/css/salt/index.css";
import "@salt-ds/theme/css/uitk/index.css";

import "../css/index.css";

const components = {
  ...saltComponents,
};

const layoutComponents = { ...saltLayouts };

const colorMode: "light" | "dark" = "light";

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
