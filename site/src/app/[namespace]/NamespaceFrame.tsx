"use client";

import { FrameProvider } from "@jpmorganchase/mosaic-layouts/frame";
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
import styles from "../../layouts/Base/Base.module.css";
import { LayoutContext, MAIN_CONTENT_ID } from "../../layouts/LayoutContext";
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
  const [mainId, setMainId] = useState<string>();
  const controls = useMemo(
    () => ({ drawerOpen, setDrawerOpen, mainId, setMainId }),
    [drawerOpen, mainId],
  );
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
            {!landing && (
              <>
                <a className={styles.skipLink} href={`#${MAIN_CONTENT_ID}`}>
                  Skip to main content
                </a>
                <AppHeader />
              </>
            )}
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
  preserveSharedConfig = false,
}: {
  sharedConfig?: SiteState["sharedConfig"];
  route: string;
  preserveSharedConfig?: boolean;
}) {
  const frame = useContext(FrameContext);
  useLayoutEffect(() => {
    frame?.store.setState({
      ...(!preserveSharedConfig && {
        sharedConfig: sharedConfig ?? frame.data.sharedConfig,
      }),
      route,
    });
  }, [frame, route, sharedConfig, preserveSharedConfig]);
  return null;
}
