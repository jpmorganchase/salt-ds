import { useMeta } from "@jpmorganchase/mosaic-store";
import { clsx } from "clsx";
import type { ComponentType, ReactNode } from "react";
import { AppHeader, Footer } from "src/components";
import { useIsMobileView } from "src/utils/useIsMobileView";
import styles from "./Base.module.css";
import { PageHeading, type PageHeadingProps } from "./PageHeading";

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

  const LeftSidebar = isMobileOrTablet ? undefined : LeftSidebarProp;
  const RightSidebar = isMobileOrTablet ? undefined : RightSidebarProp;

  return (
    <div
      className={clsx(
        styles.root,
        { [styles.oneColumn]: !LeftSidebar },
        className,
      )}
    >
      <AppHeader />
      {LeftSidebar}
      <div className={styles.middle}>
        <Heading title={title} description={description} />
        <div className={styles.twoColumn}>
          <div className={styles.content}>{children}</div>
          {RightSidebar}
        </div>
      </div>
      <Footer />
    </div>
  );
}
