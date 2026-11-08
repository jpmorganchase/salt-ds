"use client";

import {
  disposeStore,
  initializeStore,
  registerStore,
  reseedStore,
  type SiteState,
  StoreProvider,
} from "@jpmorganchase/mosaic-store";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { LocalizationProvider } from "@salt-ds/date-components";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as saltLayouts from "../layouts";
import { LayoutProvider } from "../layouts/LayoutProvider";
import { ThemeProvider } from "../ThemeProvider";

export type NamespaceData = Pick<
  SiteState,
  "sharedConfig" | "searchIndex" | "searchConfig"
>;

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
  const [store] = useState(() => initializeStore());
  useEffect(() => {
    registerStore(store);
    return () => disposeStore(store);
  }, [store]);

  return (
    <StoreProvider value={store}>
      <LocalizationProvider DateAdapter={AdapterLuxon}>
        <ThemeProvider themeClassName={themeClassName}>
          {children}
        </ThemeProvider>
      </LocalizationProvider>
    </StoreProvider>
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
  const [store] = useState(() => initializeStore(seed));
  const seededWith = useRef(seed);

  // A refresh replaces server data without unmounting the page. Reset absent
  // fields as well as changed fields, while preserving the reader's colour mode.
  useLayoutEffect(() => {
    if (seededWith.current === seed) return;
    seededWith.current = seed;
    reseedStore(store, seed);
  }, [seed, store]);
  useEffect(() => {
    registerStore(store);
    return () => disposeStore(store);
  }, [store]);

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
