import { useBreakpoint } from "@jpmorganchase/mosaic-components";
import { Sidebar } from "@jpmorganchase/mosaic-site-components";
import { SaltProvider } from "@salt-ds/core";
import clsx from "clsx";
import React, { type ReactNode } from "react";
import styles from "./LayoutColumns.module.css";

export const LayoutColumns = ({
  PrimarySidebar,
  children,
}: {
  PrimarySidebar?: ReactNode;
  children?: ReactNode;
}) => {
  const breakpoint = useBreakpoint();
  const showDrawer = breakpoint === "mobile" || breakpoint === "tablet";
  return (
    <div className={styles.root}>
      {!showDrawer && PrimarySidebar && (
        <SaltProvider applyClassesTo="child" mode="light">
          <div className={styles.sidebar}>
            <Sidebar>{PrimarySidebar}</Sidebar>
          </div>
        </SaltProvider>
      )}
      <div className={clsx(styles.main, { [styles.showDrawer]: showDrawer })}>
        {children}
      </div>
    </div>
  );
};
