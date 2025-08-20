import { useSidebar, useStore } from "@jpmorganchase/mosaic-store";
import { VerticalNavigation } from "./VerticalNavigation";

export function PageNavigation() {
  const menu = useStore((data) => data?.sharedConfig?.sidebar);
  const { selectedNodeId, selectedGroupIds } = useSidebar();
  return (
    <VerticalNavigation
      // @ts-expect-error
      menu={menu}
      selectedNodeId={selectedNodeId}
      selectedGroupIds={selectedGroupIds}
    />
  );
}
