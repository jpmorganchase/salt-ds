import {
  VerticalNavigation,
  withAppHeaderAdapter,
} from "@jpmorganchase/mosaic-site-components";
import type { TabsMenu } from "@jpmorganchase/mosaic-components";
import type { SidebarItem } from "@jpmorganchase/mosaic-store";
import { useRouter } from "next/router";

function TopLevelNavigationInner({ menu }: { menu: TabsMenu }) {
  const router = useRouter();
  const sidebarMenu = menu.map(
    (item) =>
      ({
        id: item.title,
        name: item.title,
        kind: item.type === "link" ? "data" : "group",
        data: {
          link: "link" in item ? item.link : "",
        },
      }) as SidebarItem,
  );

  const selectedId = sidebarMenu.filter((currentValue) => {
    const urlWithoutIndex =
      "data" in currentValue
        ? currentValue.data.link.replace(/\/index$/, "")
        : null;
    return urlWithoutIndex != null && router.asPath.startsWith(urlWithoutIndex);
  })[0]?.id;
  return <VerticalNavigation menu={sidebarMenu} selectedNodeId={selectedId} />;
}

const TopLevelNavigation = withAppHeaderAdapter(TopLevelNavigationInner);

export { TopLevelNavigation };
