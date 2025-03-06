import type { FC } from "react";
import { TopLevelNavigation } from "../../components/navigation/TopLevelNavigation";
import { Base } from "../Base/index";
import type { LayoutProps } from "../types/index";
import styles from "./DetailContentOnly.module.css";

export const DetailContentOnly: FC<LayoutProps> = ({ children }) => {
  const PrimarySidebar = (
    <div className={styles.primarySidebar}>
      <TopLevelNavigation />
    </div>
  );

  return <Base LeftSidebar={PrimarySidebar}>{children}</Base>;
};
