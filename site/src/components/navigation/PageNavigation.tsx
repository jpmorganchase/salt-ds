import { useSidebar } from "@jpmorganchase/mosaic-store";
import styles from "./PageNavigation.module.css";
import { VerticalNavigation } from "./VerticalNavigation";

export function PageNavigation() {
  const { menu, selectedNodeId, selectedGroupIds } = useSidebar();
  return (
    <VerticalNavigation
      className={styles.root}
      menu={menu}
      selectedNodeId={selectedNodeId}
      selectedGroupIds={selectedGroupIds}
    />
  );
}
