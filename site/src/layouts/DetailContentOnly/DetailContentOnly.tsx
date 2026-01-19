import type { LayoutProps } from "@jpmorganchase/mosaic-layouts";
import type { FC } from "react";
import { PageNavigation } from "../../components/navigation/PageNavigation";
import { Base } from "../Base/index";
import { PrimarySidebar } from "../Base/PrimarySidebar";

export const DetailContentOnly: FC<LayoutProps> = ({ children }) => {
  const LeftSidebar = (
    <PrimarySidebar>
      <PageNavigation />
    </PrimarySidebar>
  );

  return <Base LeftSidebar={LeftSidebar}>{children}</Base>;
};
