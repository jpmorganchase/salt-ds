"use client";

import {
  FrameSync as MosaicFrameSync,
  PersistentFrame,
  type SiteState,
} from "@jpmorganchase/mosaic-store";
import { usePathname } from "next/navigation";
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
import { AppHeader } from "../../components/app-header";
import { SkipToMainContent } from "../../layouts/Base/SkipToMainContent";
import { LayoutContext, MAIN_CONTENT_ID } from "../../layouts/LayoutContext";
import { createSearchNavigation } from "../../utils/searchNavigation";
import { SearchNavigationContext } from "../../utils/searchNavigationContext";
import { type NamespaceData, NamespaceDataContext } from "../providers";

const LastSharedConfigContext = createContext<
  { current: SiteState["sharedConfig"] } | undefined
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
  const [searchNavigation] = useState(createSearchNavigation);
  const frameData = useMemo(
    () => ({ sharedConfig: data.sharedConfig, route: `/${namespace}/index` }),
    [data.sharedConfig, namespace],
  );
  const lastSharedConfig = useRef(data.sharedConfig);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mainId, setMainId] = useState<string>();
  const controls = useMemo(
    () => ({ drawerOpen, setDrawerOpen, mainId, setMainId }),
    [drawerOpen, mainId],
  );
  useEffect(() => {
    if (pathname) setDrawerOpen(false);
  }, [pathname]);
  useEffect(() => () => searchNavigation.cancel(), [searchNavigation]);

  // Salt's landing page has its own hero and search, and deliberately has no
  // fixed app header. This is known from the URL before the first client paint.
  const landing =
    pathname === `/${namespace}` || pathname === `/${namespace}/index`;

  return (
    <NamespaceDataContext.Provider value={data}>
      <SearchNavigationContext.Provider value={searchNavigation}>
        <LastSharedConfigContext.Provider value={lastSharedConfig}>
          <LayoutContext.Provider value={controls}>
            <PersistentFrame
              data={frameData}
              renderHeader={() =>
                !landing && (
                  <>
                    <SkipToMainContent targetId={MAIN_CONTENT_ID} />
                    <AppHeader />
                  </>
                )
              }
            >
              {children}
            </PersistentFrame>
          </LayoutContext.Provider>
        </LastSharedConfigContext.Provider>
      </SearchNavigationContext.Provider>
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
  const lastSharedConfig = useContext(LastSharedConfigContext);
  const namespaceData = useContext(NamespaceDataContext);
  const searchNavigation = useContext(SearchNavigationContext);
  const currentSharedConfig = preserveSharedConfig
    ? lastSharedConfig?.current
    : sharedConfig;
  useLayoutEffect(() => {
    if (!preserveSharedConfig && lastSharedConfig) {
      lastSharedConfig.current = sharedConfig ?? namespaceData?.sharedConfig;
    }
    searchNavigation?.commitRoute(route);
  }, [
    lastSharedConfig,
    route,
    sharedConfig,
    preserveSharedConfig,
    namespaceData,
    searchNavigation,
  ]);
  return <MosaicFrameSync route={route} sharedConfig={currentSharedConfig} />;
}
