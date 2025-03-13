import type { LayoutProps } from "@jpmorganchase/mosaic-layouts/dist/types";
import { Divider } from "@salt-ds/core";
import type { FC } from "react";
import { PageNavigation } from "../../components/navigation/PageNavigation";
import { TopLevelNavigation } from "../../components/navigation/TopLevelNavigation";
import { TableOfContents } from "../../components/toc/index";
import { PrimarySidebar } from "../Base/PrimarySidebar";
import { SecondarySidebar } from "../Base/SecondarySidebar";
import { Base } from "../Base/index";
import styles from "./DetailTechnical.module.css";

export const DetailTechnical: FC<LayoutProps> = ({ children }) => {
  const LeftSidebar = (
    <PrimarySidebar>
      <TopLevelNavigation />
      <Divider variant="tertiary" />
      <PageNavigation />
    </PrimarySidebar>
  );

  const RightSidebar = (
    <SecondarySidebar>
      <TableOfContents />
    </SecondarySidebar>
  );

  return (
    <Base
      className={styles.root}
      LeftSidebar={LeftSidebar}
      RightSidebar={RightSidebar}
    >
      {children}
    </Base>
  );
};
