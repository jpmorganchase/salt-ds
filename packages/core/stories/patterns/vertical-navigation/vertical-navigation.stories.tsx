import {
  BorderItem,
  BorderLayout,
  NavigationItem,
  StackLayout,
  Text,
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
import { type Dispatch, type FC, type SetStateAction, useState } from "react";

export default {
  title: "Patterns/Vertical Navigation",
} as Meta;

interface NavigationItemData {
  name: string;
  href?: string;
  children?: NavigationItemData[];
  level?: number;
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
    { name: "Overview", href: "#", icon: <PinIcon /> },
    { name: "Data analysis", href: "#", icon: <LineChartIcon /> },
    { name: "Market monitor", href: "#", icon: <NotificationIcon /> },
    { name: "Checks", href: "#", icon: <SearchIcon /> },
    { name: "Operations", href: "#", icon: <UserIcon /> },
    { name: "Trades", href: "#", icon: <ReceiptIcon /> },
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
          <nav>
            <StackLayout
              gap="var(--salt-spacing-fixed-100)"
              as="ul"
              style={{ listStyle: "none", margin: 0, padding: 0 }}
            >
              {navigationData.map((item) => (
                <li style={{ listStyle: "none" }} key={item.name}>
                  <NavigationItem
                    active={active === item.name}
                    href={item.href}
                    orientation="vertical"
                    onClick={(event) => {
                      // prevent default to avoid navigation in storybook example
                      event.preventDefault();
                      setActive(item.name);
                    }}
                  >
                    {item.icon}
                    {item.name}
                  </NavigationItem>
                </li>
              ))}
            </StackLayout>
          </nav>
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

const isParentOfActiveItem = (
  children: NavigationItemData[],
  activeName: string,
): boolean => {
  return children.some((child: NavigationItemData) => {
    if (child.name === activeName) return true;
    return child.children
      ? isParentOfActiveItem(child.children, activeName)
      : false;
  });
};

const RecursiveNavItem: FC<{
  item: NavigationItemData;
  active: string;
  setActive: Dispatch<SetStateAction<string>>;
  initiallyExpanded?: string[];
}> = ({ item, active, setActive, initiallyExpanded = [] }) => {
  const [expanded, setExpanded] = useState<string[]>(initiallyExpanded);

  const handleExpand = (item: NavigationItemData) => () => {
    const isExpanded = expanded.includes(item.name);
    setExpanded(
      isExpanded
        ? expanded.filter((name) => name !== item.name)
        : [...expanded, item.name],
    );
  };

  return (
    <li style={{ listStyle: "none" }} key={item.name}>
      <NavigationItem
        active={active === item.name}
        blurActive={
          item.children && !expanded.includes(item.name)
            ? isParentOfActiveItem(item.children, active)
            : false
        }
        href={item.href}
        expanded={expanded.includes(item.name)}
        orientation="vertical"
        onClick={(event) => {
          // prevent default to avoid navigation in storybook example
          event.preventDefault();
          if (item.href) {
            setActive(item.name);
          }
        }}
        level={item.level || 0}
        onExpand={handleExpand(item)}
        parent={!!item.children}
      >
        {item.name}
      </NavigationItem>
      {item.children &&
        expanded.includes(item.name) &&
        item.children.map((child) => (
          <RecursiveNavItem
            item={{ ...child, level: (item.level || 0) + 1 }}
            key={item.name}
            active={active}
            setActive={setActive}
            initiallyExpanded={initiallyExpanded}
          />
        ))}
    </li>
  );
};

export const NestedGroup = () => {
  const navigationData = [
    { name: "Overview", href: "#" },
    {
      name: "Data",
      children: [
        { name: "Group overview", href: "#" },
        {
          name: "Data analysis",
          children: [{ name: "Monitoring", href: "#" }],
        },
      ],
    },
    { name: "Trades", href: "#" },
    { name: "Reports", href: "#" },
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
          <nav>
            <StackLayout
              gap="var(--salt-spacing-fixed-100)"
              as="ul"
              style={{ listStyle: "none", margin: 0, padding: 0 }}
            >
              {navigationData.map((item) => (
                <RecursiveNavItem
                  item={item}
                  key={item.name}
                  active={active}
                  setActive={setActive}
                  initiallyExpanded={["Data", "Data analysis"]}
                />
              ))}
            </StackLayout>
          </nav>
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
          <nav aria-label="On-page sections">
            <StackLayout
              gap="var(--salt-spacing-fixed-100)"
              as="ul"
              style={{ listStyle: "none", margin: 0, padding: 0 }}
            >
              {navigationData.map((item) => (
                <li key={item.name} style={{ listStyle: "none" }}>
                  <NavigationItem
                    active={active === item.name}
                    href={`#${item.id}`}
                    orientation="vertical"
                    onClick={(event) => {
                      event.preventDefault();
                      setActive(item.name);
                    }}
                  >
                    {item.name}
                  </NavigationItem>
                </li>
              ))}
            </StackLayout>
          </nav>
        </aside>
      </BorderItem>
    </BorderLayout>
  );
};

SecondaryNavigation.parameters = {
  layout: "fullscreen",
};
