"use client";

import {
  ColorModeProvider,
  type SiteState,
  StoreProvider,
  useMosaicStore,
} from "@jpmorganchase/mosaic-store";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { LocalizationProvider } from "@salt-ds/date-components";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import * as saltLayouts from "../layouts";
import { LayoutProvider } from "../layouts/LayoutProvider";
import { ThemeProvider } from "../ThemeProvider";

export type NamespaceData = Pick<SiteState, "sharedConfig">;

export const NamespaceDataContext = createContext<NamespaceData | undefined>(
  undefined,
);

/** Keep the theme store alive while the App Router replaces page content. */
export function Providers({
  children,
  themeClassName,
}: {
  children: ReactNode;
  themeClassName: string;
}) {
  return (
    <ColorModeProvider>
      <LocalizationProvider DateAdapter={AdapterLuxon}>
        <ThemeProvider themeClassName={themeClassName}>
          {children}
        </ThemeProvider>
      </LocalizationProvider>
    </ColorModeProvider>
  );
}

/** A fresh page store prevents one page's metadata leaking into another. */
export function StoreShell({
  storeProps,
  children,
}: {
  storeProps: Partial<SiteState> & Record<string, unknown>;
  children: ReactNode;
}) {
  const defaults = useContext(NamespaceDataContext);
  const seed = useMemo(
    () => ({ ...defaults, ...storeProps }),
    [defaults, storeProps],
  );
  const store = useMosaicStore(seed);

  return (
    <StoreProvider value={store}>
      <LayoutProvider
        defaultLayout="DetailError"
        layoutComponents={saltLayouts}
      >
        {children}
      </LayoutProvider>
    </StoreProvider>
  );
}
