import React, { ReactNode } from "react";
import classnames from "classnames";
import { Sidebar } from "@jpmorganchase/mosaic-site-components";
import { useBreakpoint } from "@jpmorganchase/mosaic-components";
import styles from "./LayoutColumns.module.css";

export const LayoutColumns = ({
  PrimarySidebar,
  children,
}: {
  PrimarySidebar?: ReactNode;
  children?: ReactNode;
}) => {
  const breakpoint = useBreakpoint();
  const showDrawer = breakpoint === "mobile" || breakpoint == "tablet";
  return (
    <div
      className={classnames({
        [styles.fullWidth]: !PrimarySidebar,
        [styles.withSidebar]: PrimarySidebar,
      })}
    >
      {!showDrawer && PrimarySidebar && <Sidebar>{PrimarySidebar}</Sidebar>}
      <div className={styles.mainWrapper}>
        <div className={styles.columnWrapper}>
          <div className={styles.contentColumn}>
            <main className={styles.contentBody}>{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};
