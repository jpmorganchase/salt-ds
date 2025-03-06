import { PageNavigation } from "@jpmorganchase/mosaic-site-components";
import type { FC } from "react";
import { TableOfContents } from "../../components/toc/index";
import { Base } from "../Base/index";
import type { LayoutProps } from "../types/index";
import styles from "./DetailTechnical.module.css";
import { TopLevelNavigation } from "../../components/navigation/TopLevelNavigation";
import { Divider } from "@salt-ds/core";

export const DetailTechnical: FC<LayoutProps> = ({ children }) => {
  const PrimarySidebar = (
    <div className={styles.primarySidebar}>
      <TopLevelNavigation />
      <Divider variant="tertiary" />
      <PageNavigation />
    </div>
  );

  const RightSidebar = (
    <div className={styles.secondarySidebar}>
      <TableOfContents />
    </div>
  );

  return (
    <Base
      className={styles.root}
      LeftSidebar={PrimarySidebar}
      RightSidebar={RightSidebar}
    >
      {children}
    </Base>
  );
};
