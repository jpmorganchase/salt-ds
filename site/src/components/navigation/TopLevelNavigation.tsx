import type { TabsMenu } from "@jpmorganchase/mosaic-components";
import {
  VerticalNavigation,
  withAppHeaderAdapter,
} from "@jpmorganchase/mosaic-site-components";
import type { SidebarItem } from "@jpmorganchase/mosaic-store";
import { Dropdown, Option } from "@salt-ds/core";
import { useRouter } from "next/router";
import { useIsMobileView } from "../../utils/useIsMobileView";
import styles from "./TopLevelNavigation.module.css";

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
  })[0];

  const isMobileOrTablet = useIsMobileView();

  return (
    <div className={styles.root}>
      {isMobileOrTablet ? (
        <Dropdown<SidebarItem>
          selected={[selectedId]}
          bordered
          valueToString={(item) => item?.name}
          onSelectionChange={(_, [item]) => {
            if ("data" in item && item.data.link) {
              router.push(item.data.link);
            }
          }}
        >
          {sidebarMenu.map((item) => (
            <Option key={item.id} value={item} />
          ))}
        </Dropdown>
      ) : (
        <VerticalNavigation
          menu={sidebarMenu}
          selectedNodeId={selectedId?.id}
        />
      )}
    </div>
  );
}

const TopLevelNavigation = withAppHeaderAdapter(TopLevelNavigationInner);

export { TopLevelNavigation };
