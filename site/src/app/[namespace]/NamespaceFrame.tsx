"use client";

import { FrameProvider } from "@jpmorganchase/mosaic-layouts";
import {
  disposeStore,
  initializeStore,
  registerStore,
  type SiteState,
  StoreProvider,
} from "@jpmorganchase/mosaic-store";
import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { AppHeader } from "../../components/app-header";
import { LayoutContext } from "../../layouts/LayoutContext";
import { type NamespaceData, NamespaceDataContext } from "../providers";

const FRAME = { header: true };
const FrameContext = createContext<
  | {
      store: ReturnType<typeof initializeStore>;
      data: NamespaceData;
    }
  | undefined
>(undefined);

/** Salt supplies its own header; Mosaic coordinates it with the page layouts. */
export function NamespaceFrame({
  namespace,
  data,
  children,
}: {
  namespace: string;
  data: NamespaceData;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [store] = useState(() =>
    initializeStore({ ...data, route: `/${namespace}/index` }),
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const controls = useMemo(() => ({ drawerOpen, setDrawerOpen }), [drawerOpen]);
  const frame = useMemo(() => ({ store, data }), [store, data]);

  useLayoutEffect(() => {
    store.setState({
      searchIndex: data.searchIndex,
      searchConfig: data.searchConfig,
    });
  }, [store, data]);
  useEffect(() => {
    registerStore(store);
    return () => disposeStore(store);
  }, [store]);
  useEffect(() => {
    if (pathname) setDrawerOpen(false);
  }, [pathname]);

  // Salt's landing page has its own hero and search, and deliberately has no
  // fixed app header. This is known from the URL before the first client paint.
  const landing =
    pathname === `/${namespace}` || pathname === `/${namespace}/index`;

  return (
    <NamespaceDataContext.Provider value={data}>
      <FrameContext.Provider value={frame}>
        <LayoutContext.Provider value={controls}>
          <StoreProvider value={store}>
            {!landing && <AppHeader />}
            <FrameProvider value={FRAME}>{children}</FrameProvider>
          </StoreProvider>
        </LayoutContext.Provider>
      </FrameContext.Provider>
    </NamespaceDataContext.Provider>
  );
}

/** Relative links in the persistent header must use the resolved page route. */
export function FrameSync({
  sharedConfig,
  route,
}: {
  sharedConfig?: SiteState["sharedConfig"];
  route: string;
}) {
  const frame = useContext(FrameContext);
  useLayoutEffect(() => {
    frame?.store.setState({
      sharedConfig: sharedConfig ?? frame.data.sharedConfig,
      route,
    });
  }, [frame, route, sharedConfig]);
  return null;
}
