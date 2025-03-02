import type { LayoutProps } from "@jpmorganchase/mosaic-layouts/dist/types";
import type { FC } from "react";
import { TopLevelNavigation } from "../../components/navigation/TopLevelNavigation";
import { PrimarySidebar } from "../Base/PrimarySidebar";
import { Base } from "../Base/index";

export const DetailContentOnly: FC<LayoutProps> = ({ children }) => {
  const LeftSidebar = (
    <PrimarySidebar>
      <TopLevelNavigation />
    </PrimarySidebar>
  );

  return <Base LeftSidebar={LeftSidebar}>{children}</Base>;
};
