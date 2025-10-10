import { useSidebar, useStore } from "@jpmorganchase/mosaic-store";
import { VerticalNavigation } from "./vertical-navigation";
import type { SidebarNodeWithStatus } from "./vertical-navigation/utils";

export function PageNavigation() {
  const menu = useStore(
    (data) => data?.sharedConfig?.sidebar,
  ) as unknown as SidebarNodeWithStatus[];

  const { selectedNodeId } = useSidebar();
  return <VerticalNavigation menu={menu} selectedNodeId={selectedNodeId} />;
}
