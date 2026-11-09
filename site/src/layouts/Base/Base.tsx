import { useFrame } from "@jpmorganchase/mosaic-layouts/frame";
import { useRoute, useStore } from "@jpmorganchase/mosaic-store";
import { type DrawerProps, SkipLink, useId } from "@salt-ds/core";
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
import { LayoutContext } from "../LayoutContext";
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

  const LeftSidebar = isMobileOrTablet ? (
    <Drawer
      open={drawerOpen}
      onOpenChange={(newOpen) => setDrawerOpen(newOpen)}
    >
      {LeftSidebarProp}
    </Drawer>
  ) : (
    LeftSidebarProp
  );
  const RightSidebar = isMobileOrTablet ? undefined : RightSidebarProp;

  const context = useMemo(
    () => ({
      drawerOpen,
      setDrawerOpen,
    }),
    [drawerOpen, setDrawerOpen],
  );

  const headingId = useId();
  const mainId = useId();
  const { setMainId } = frameControls;

  // The frame's skip link must precede its retained header and always point to
  // the current main element, including when an error boundary replaces a page.
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
          { [styles.oneColumn]: !LeftSidebar || isMobileOrTablet },
          className,
        )}
      >
        {!frame.header && mainId && (
          <SkipLink targetId={mainId}>Skip to main content</SkipLink>
        )}
        {!frame.header && <AppHeader />}
        {LeftSidebar}
        <main id={mainId} className={styles.middle}>
          {(title || description) && (
            <Heading title={title} description={description} id={headingId} />
          )}
          <div className={styles.twoColumn}>
            <div className={styles.content}>{children}</div>
            {RightSidebar}
          </div>
        </main>
        <Footer />
      </div>
    </LayoutContext.Provider>
  );
}
