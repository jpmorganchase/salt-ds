import type { LayoutProps } from "@jpmorganchase/mosaic-layouts/dist/types";
import type { FC } from "react";
import { PageNavigation } from "../../components/navigation/PageNavigation";
import { TableOfContents } from "../../components/toc/index";
import { Base } from "../Base/index";
import { PrimarySidebar } from "../Base/PrimarySidebar";
import { SecondarySidebar } from "../Base/SecondarySidebar";
import styles from "./DetailTechnical.module.css";

export const DetailTechnical: FC<LayoutProps> = ({ children }) => {
  const LeftSidebar = (
    <PrimarySidebar>
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
