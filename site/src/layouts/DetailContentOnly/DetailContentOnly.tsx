import type { LayoutProps } from "@jpmorganchase/mosaic-layouts/dist/types";
import type { FC } from "react";
import { PrimarySidebar } from "../Base/PrimarySidebar";
import { Base } from "../Base/index";
import { PageNavigation } from "../../components/navigation/PageNavigation";

export const DetailContentOnly: FC<LayoutProps> = ({ children }) => {
  const LeftSidebar = (
    <PrimarySidebar>
      <PageNavigation />
    </PrimarySidebar>
  );

  return <Base LeftSidebar={LeftSidebar}>{children}</Base>;
};
