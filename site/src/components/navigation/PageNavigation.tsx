import { useSidebar } from "@jpmorganchase/mosaic-store";
import { VerticalNavigation } from "./VerticalNavigation";

export function PageNavigation() {
  const { menu, selectedNodeId, selectedGroupIds } = useSidebar();
  return (
    <VerticalNavigation
      menu={menu}
      selectedNodeId={selectedNodeId}
      selectedGroupIds={selectedGroupIds}
    />
  );
}
