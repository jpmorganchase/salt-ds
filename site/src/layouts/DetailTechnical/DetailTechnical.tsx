import type { LayoutProps } from "@jpmorganchase/mosaic-layouts";
import { type SiteState, useStore } from "@jpmorganchase/mosaic-store";
import type { FC } from "react";
import { PageNavigation } from "../../components/navigation/PageNavigation";
import { TableOfContents } from "../../components/toc/index";
import { RuntimeTableOfContents } from "../../components/toc/RuntimeTableOfContents";
import { Base } from "../Base/index";
import { PrimarySidebar } from "../Base/PrimarySidebar";
import { SecondarySidebar } from "../Base/SecondarySidebar";
import styles from "./DetailTechnical.module.css";

type Data = {
  includeRuntimeTableOfContents?: boolean;
};

type CustomSiteState = SiteState & { data?: Data };

export const DetailTechnical: FC<LayoutProps> = ({ children }) => {
  const includeRuntimeTableOfContents =
    useStore(
      (state: CustomSiteState) => state.data?.includeRuntimeTableOfContents,
    ) ?? false;

  const LeftSidebar = (
    <PrimarySidebar>
      <PageNavigation />
    </PrimarySidebar>
  );
  const TableOfContentsComponent = includeRuntimeTableOfContents
    ? RuntimeTableOfContents
    : TableOfContents;

  const RightSidebar = (
    <SecondarySidebar>
      <TableOfContentsComponent />
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
