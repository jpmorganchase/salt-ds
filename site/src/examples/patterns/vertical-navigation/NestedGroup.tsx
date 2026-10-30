import {
  BorderItem,
  BorderLayout,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  Link,
  StackLayout,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemExpansionIcon,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
  VerticalNavigationSubMenu,
} from "@salt-ds/core";
import { type ReactNode, useState } from "react";
import { Header, Item } from "./SingleLevel";

interface NavigationItemData {
  name: string;
  href?: string;
  icon?: ReactNode;
  children?: NavigationItemData[];
}

const RecursiveNavItem = ({
  item,
  active,
  setActive,
  initiallyExpanded = [],
}: {
  item: NavigationItemData;
  active: string;
  setActive: (name: string) => void;
  initiallyExpanded?: string[];
}) => {
  if (item.children?.length) {
    return (
      <VerticalNavigationItem>
        <Collapsible defaultOpen={initiallyExpanded.includes(item.name)}>
          <VerticalNavigationItemContent>
            <CollapsibleTrigger>
              <VerticalNavigationItemTrigger>
                <VerticalNavigationItemLabel>
                  {item.name}
                </VerticalNavigationItemLabel>
                <VerticalNavigationItemExpansionIcon />
              </VerticalNavigationItemTrigger>
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <RecursiveNavItem
                  item={child}
                  key={child.name}
                  active={active}
                  setActive={setActive}
                  initiallyExpanded={initiallyExpanded}
                />
              ))}
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </Collapsible>
      </VerticalNavigationItem>
    );
  }

  return (
    <VerticalNavigationItem active={active === item.name}>
      <VerticalNavigationItemContent>
        <VerticalNavigationItemTrigger
          render={item.href ? <Link href={item.href} /> : undefined}
          onClick={(event) => {
            event.preventDefault();
            setActive(item.name);
          }}
        >
          <VerticalNavigationItemLabel>{item.name}</VerticalNavigationItemLabel>
        </VerticalNavigationItemTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
};

export const NestedGroup = () => {
  const navigationData = [
    { name: "Overview", href: "/overview" },
    {
      name: "Data",
      children: [
        { name: "Group overview", href: "/data" },
        {
          name: "Data analysis",
          children: [{ name: "Monitoring", href: "/data/monitoring" }],
        },
      ],
    },
    { name: "Trades", href: "/trades" },
    { name: "Reports", href: "/reports" },
  ];

  const [active, setActive] = useState("Monitoring");

  return (
    <BorderLayout>
      <BorderItem position="north" sticky>
        <Header />
      </BorderItem>
      <BorderItem
        position="west"
        sticky
        style={{
          top: "calc(var(--salt-spacing-300) * 2)",
          maxHeight: "calc(100vh - var(--salt-spacing-300) * 2)",
        }}
      >
        <aside style={{ width: "250px" }}>
          <VerticalNavigation aria-label="Primary navigation">
            {navigationData.map((item) => (
              <RecursiveNavItem
                item={item}
                key={item.name}
                active={active}
                setActive={setActive}
                initiallyExpanded={["Data", "Data analysis"]}
              />
            ))}
          </VerticalNavigation>
        </aside>
      </BorderItem>
      <BorderItem position="center">
        <StackLayout
          gap="var(--salt-spacing-400)"
          padding="var(--salt-spacing-400)"
        >
          <Item />
          <Item />
          <Item />
          <Item />
        </StackLayout>
      </BorderItem>
    </BorderLayout>
  );
};
