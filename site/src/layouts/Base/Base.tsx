import { useMeta, useRoute } from "@jpmorganchase/mosaic-store";
import type { DrawerProps } from "@salt-ds/core";
import { clsx } from "clsx";
import dynamic from "next/dynamic";
import {
  type ComponentType,
  type ReactNode,
  useEffect,
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
  const {
    meta: { title, description },
  } = useMeta();

  const isMobileOrTablet = useIsMobileView();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { route } = useRoute();

  useEffect(() => {
    if (route) {
      // Close drawer whenever a page loads
      setDrawerOpen(false);
    }
  }, [route]);

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
    [drawerOpen],
  );

  return (
    <LayoutContext.Provider value={context}>
      <div
        className={clsx(
          styles.root,
          { [styles.oneColumn]: !LeftSidebar || isMobileOrTablet },
          className,
        )}
      >
        <AppHeader />
        {LeftSidebar}
        <div className={styles.middle}>
          {(title || description) && (
            <Heading title={title} description={description} />
          )}
          <div className={styles.twoColumn}>
            <div className={styles.content}>{children}</div>
            {RightSidebar}
          </div>
        </div>
        <Footer />
      </div>
    </LayoutContext.Provider>
  );
}
