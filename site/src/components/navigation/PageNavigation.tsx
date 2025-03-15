import { useSidebar, useStore } from "@jpmorganchase/mosaic-store";
import styles from "./PageNavigation.module.css";
import { VerticalNavigation } from "./VerticalNavigation";

export function PageNavigation() {
  const menu = useStore((data) => data?.sharedConfig?.sidebar);
  const { selectedNodeId, selectedGroupIds } = useSidebar();
  return (
    <VerticalNavigation
      className={styles.root}
      // @ts-ignore
      menu={menu}
      selectedNodeId={selectedNodeId}
      selectedGroupIds={selectedGroupIds}
    />
  );
}
