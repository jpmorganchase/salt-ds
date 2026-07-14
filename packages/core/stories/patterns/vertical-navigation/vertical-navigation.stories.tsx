import {
  BorderItem,
  BorderLayout,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  Link,
  StackLayout,
  Text,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemExpansionIcon,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
  VerticalNavigationSubMenu,
} from "@salt-ds/core";
import {
  LineChartIcon,
  NotificationIcon,
  PinIcon,
  ReceiptIcon,
  SearchIcon,
  UserIcon,
} from "@salt-ds/icons";
import type { Meta } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";

export default {
  title: "Patterns/Vertical Navigation",
} as Meta;

interface NavigationItemData {
  name: string;
  href?: string;
  icon?: ReactNode;
  children?: NavigationItemData[];
}

const Item = () => {
  return (
    <div
      style={{
        padding: "calc(var(--salt-spacing-400)*4)",
        margin: "var(--salt-spacing-400)",
        backgroundColor: "var(--salt-container-tertiary-background)",
      }}
    />
  );
};

const Header = () => {
  return (
    <header
      style={{
        padding: "var(--salt-spacing-300)",
        backgroundColor: "var(--salt-container-secondary-background)",
      }}
    />
  );
};

export const SingleLevel = () => {
  const navigationData = [
    { name: "Overview", href: "/overview", icon: <PinIcon /> },
    {
      name: "Data analysis",
      href: "/data-analysis",
      icon: <LineChartIcon />,
    },
    {
      name: "Market monitor",
      href: "/market-monitor",
      icon: <NotificationIcon />,
    },
    { name: "Checks", href: "/checks", icon: <SearchIcon /> },
    { name: "Operations", href: "/operations", icon: <UserIcon /> },
    { name: "Trades", href: "/trades", icon: <ReceiptIcon /> },
  ];

  const [active, setActive] = useState(navigationData[0].name);

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
        <aside style={{ width: "200px" }}>
          <VerticalNavigation aria-label="Primary navigation">
            {navigationData.map((item) => (
              <VerticalNavigationItem
                active={active === item.name}
                key={item.name}
              >
                <VerticalNavigationItemContent>
                  <VerticalNavigationItemTrigger
                    render={<Link href={item.href} />}
                    onClick={(event) => {
                      event.preventDefault();
                      setActive(item.name);
                    }}
                  >
                    {item.icon}
                    <VerticalNavigationItemLabel>
                      {item.name}
                    </VerticalNavigationItemLabel>
                  </VerticalNavigationItemTrigger>
                </VerticalNavigationItemContent>
              </VerticalNavigationItem>
            ))}
          </VerticalNavigation>
        </aside>
      </BorderItem>
      <BorderItem position="center">
        <Item />
        <Item />
        <Item />
        <Item />
      </BorderItem>
    </BorderLayout>
  );
};

SingleLevel.parameters = {
  layout: "fullscreen",
};

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
        <Item />
        <Item />
        <Item />
        <Item />
      </BorderItem>
    </BorderLayout>
  );
};

NestedGroup.parameters = {
  layout: "fullscreen",
};

export const SecondaryNavigation = () => {
  const navigationData = [
    { id: "overview", name: "Overview" },
    { id: "exposure", name: "Exposure" },
    { id: "positions", name: "Positions" },
    { id: "limits", name: "Limits" },
  ];
  const [active, setActive] = useState(navigationData[0].name);

  return (
    <BorderLayout>
      <BorderItem position="north" sticky>
        <Header />
      </BorderItem>
      <BorderItem position="center">
        <StackLayout gap={4} style={{ padding: "var(--salt-spacing-400)" }}>
          {navigationData.map((item) => (
            <section
              id={item.id}
              key={item.name}
              style={{
                minHeight: "160px",
                padding: "var(--salt-spacing-400)",
                backgroundColor: "var(--salt-container-tertiary-background)",
              }}
            >
              <Text
                style={{ fontWeight: "var(--salt-text-fontWeight-strong)" }}
              >
                {item.name}
              </Text>
            </section>
          ))}
        </StackLayout>
      </BorderItem>
      <BorderItem
        position="east"
        sticky
        style={{
          top: "calc(var(--salt-spacing-300) * 2)",
          maxHeight: "calc(100vh - var(--salt-spacing-300) * 2)",
          padding: "var(--salt-spacing-200)",
        }}
      >
        <aside style={{ width: "180px" }}>
          <VerticalNavigation aria-label="On-page sections">
            {navigationData.map((item) => (
              <VerticalNavigationItem
                active={active === item.name}
                key={item.name}
              >
                <VerticalNavigationItemContent>
                  <VerticalNavigationItemTrigger
                    render={<Link href={`#${item.id}`} />}
                    onClick={(event) => {
                      event.preventDefault();
                      setActive(item.name);
                    }}
                  >
                    <VerticalNavigationItemLabel>
                      {item.name}
                    </VerticalNavigationItemLabel>
                  </VerticalNavigationItemTrigger>
                </VerticalNavigationItemContent>
              </VerticalNavigationItem>
            ))}
          </VerticalNavigation>
        </aside>
      </BorderItem>
    </BorderLayout>
  );
};

SecondaryNavigation.parameters = {
  layout: "fullscreen",
};
