import { useFrame } from "@jpmorganchase/mosaic-layouts/frame";
import { useRoute, useStore } from "@jpmorganchase/mosaic-store";
import { type DrawerProps, useId } from "@salt-ds/core";
import { clsx } from "clsx";
import dynamic from "next/dynamic";
import {
  type ComponentType,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { AppHeader, Footer } from "src/components";
import { useIsMobileView } from "src/utils/useIsMobileView";
import { LayoutContext, MAIN_CONTENT_ID } from "../LayoutContext";
import styles from "./Base.module.css";
import { PageHeading, type PageHeadingProps } from "./PageHeading";

const Drawer = dynamic<DrawerProps>(() =>
  import("./Drawer").then((mod) => mod.Drawer),
);

export function Base({
  children,
  className,
  LeftSidebar: LeftSidebarProp,
  RightSidebar: RightSidebarProp,
  Heading = PageHeading,
}: {
  className?: string;
  children: ReactNode;
  LeftSidebar?: ReactNode;
  RightSidebar?: ReactNode;
  Heading?: ComponentType<PageHeadingProps>;
}) {
  const { description, title } = useStore((state) => ({
    description: state.description,
    title: state.title,
  }));

  const isMobileOrTablet = useIsMobileView();
  const [localDrawerOpen, setLocalDrawerOpen] = useState(false);
  const frame = useFrame();
  const frameControls = useContext(LayoutContext);
  const { drawerOpen, setDrawerOpen } = frame.header
    ? frameControls
    : { drawerOpen: localDrawerOpen, setDrawerOpen: setLocalDrawerOpen };

  const { route } = useRoute();

  useEffect(() => {
    if (route) {
      // Close drawer whenever a page loads
      setDrawerOpen(false);
    }
  }, [route, setDrawerOpen]);

  const context = useMemo(
    () => ({
      drawerOpen,
      setDrawerOpen,
    }),
    [drawerOpen, setDrawerOpen],
  );

  const headingId = useId();
  const localMainId = useId();
  const mainId = frame.header ? MAIN_CONTENT_ID : localMainId;
  const { setMainId } = frameControls;

  // Let the retained header know when the page-owned drawer can open.
  useLayoutEffect(() => {
    if (!frame.header || !setMainId) return;
    setMainId(mainId);
    return () => setMainId(undefined);
  }, [frame.header, mainId, setMainId]);

  return (
    <LayoutContext.Provider value={context}>
      <div
        className={clsx(
          styles.root,
          { [styles.oneColumn]: !LeftSidebarProp },
          className,
        )}
      >
        {!frame.header && mainId && (
          <a className={styles.skipLink} href={`#${mainId}`}>
            Skip to main content
          </a>
        )}
        {!frame.header && <AppHeader />}
        {LeftSidebarProp && (
          <div className={styles.desktopSidebar}>{LeftSidebarProp}</div>
        )}
        {isMobileOrTablet && (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            {LeftSidebarProp}
          </Drawer>
        )}
        <main id={mainId} className={styles.middle} tabIndex={-1}>
          {(title || description) && (
            <Heading title={title} description={description} id={headingId} />
          )}
          <div className={styles.twoColumn}>
            <div className={styles.content}>{children}</div>
            {RightSidebarProp && (
              <div className={styles.desktopSidebar}>{RightSidebarProp}</div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </LayoutContext.Provider>
  );
}
