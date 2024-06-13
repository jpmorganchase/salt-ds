import React, { ReactNode } from "react";
import clsx from "clsx";
import { SaltProvider } from "@salt-ds/core";
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
    <div className={styles.root}>
      {!showDrawer && PrimarySidebar && (
        <SaltProvider applyClassesTo="child" mode="light">
          <div className={styles.sidebar}>
            <Sidebar>{PrimarySidebar}</Sidebar>
          </div>
        </SaltProvider>
      )}
      <main className={clsx(styles.main, { [styles.showDrawer]: showDrawer })}>
        {children}
      </main>
    </div>
  );
};
