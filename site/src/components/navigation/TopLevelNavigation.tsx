import {
  type AppHeaderMenu,
  type SidebarItem,
  useAppHeader,
} from "@jpmorganchase/mosaic-store";
import type { DropdownProps, OptionProps } from "@salt-ds/core";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useIsMobileView } from "../../utils/useIsMobileView";
import { VerticalNavigation } from "../navigation/VerticalNavigation";
import styles from "./TopLevelNavigation.module.css";

const Dropdown = dynamic<DropdownProps<SidebarItem>>(() =>
  import("@salt-ds/core").then((mod) => mod.Dropdown),
);

const Option = dynamic<OptionProps>(() =>
  import("@salt-ds/core").then((mod) => mod.Option),
);

function createSidebarItems(menu: AppHeaderMenu) {
  return menu.reduce<SidebarItem[]>((result, menuItem) => {
    if (menuItem?.title && menuItem.type === "link") {
      const tabsLinkItem: SidebarItem = {
        id: menuItem.title,
        name: menuItem.title,
        kind: "data",
        hidden: false,
        data: {
          level: 0,
          link: menuItem.link,
        },
      };
      result.push(tabsLinkItem);
    }
    return result;
  }, []);
}

export function TopLevelNavigation() {
  const router = useRouter();
  const appHeader = useAppHeader();
  const sidebarMenu = createSidebarItems(appHeader?.menu ?? []);

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
        <Dropdown
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
