import { FC, useState } from "react";
import {
  BorderLayout,
  BorderItem,
  NavigationItem,
  StackLayout,
} from "@salt-ds/core";
import { Meta } from "@storybook/react";
import {
  LineChartIcon,
  NotificationIcon,
  PinIcon,
  SearchIcon,
  ReceiptIcon,
  UserIcon,
} from "@salt-ds/icons";

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
        backgroundColor: "var(--salt-color-gray-10)",
      }}
    />
  );
};

const Header = () => {
  return (
    <header
      style={{
        position: "fixed",
        padding: "var(--salt-spacing-300)",
        backgroundColor: "var(--salt-color-gray-40)",
        width: "100%",
        zIndex: "var(--salt-zIndex-appHeader)",
      }}
    />
  );
};

// TODO add border gap between items

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
      <BorderItem position="north">
        <Header />
      </BorderItem>
      <BorderItem
        position="west"
        style={{
          marginTop: "calc(var(--salt-spacing-300) * 2)", // Margin should be the height of the header
          position: "fixed",
        }}
      >
        <aside style={{ width: "250px" }}>
          <nav>
            <StackLayout
              gap="var(--salt-size-border)"
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
      <BorderItem
        position="center"
        style={{
          marginTop: "calc(var(--salt-spacing-300) * 2)",
          marginLeft: "250px",
        }}
      >
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

export const Nested = () => {
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

  const [active, setActive] = useState(navigationData[0].name);
  const [expanded, setExpanded] = useState<string[]>([]);

  const handleExpand = (item: NavigationItemData) => () => {
    const isExpanded = expanded.includes(item.name);
    setExpanded(
      isExpanded
        ? expanded.filter((name) => name !== item.name)
        : [...expanded, item.name]
    );
  };

  const isParentOfActiveItem = (
    children: NavigationItemData[],
    activeName: string
  ): boolean => {
    return children.some((child: NavigationItemData) => {
      if (child.name === activeName) return true;
      return child.children
        ? isParentOfActiveItem(child.children, activeName)
        : false;
    });
  };

  const RecursiveNavItem: FC<{ item: NavigationItemData }> = ({ item }) => {
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
            setActive(item.name);
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
            />
          ))}
      </li>
    );
  };

  return (
    <BorderLayout>
      <BorderItem position="north">
        <Header />
      </BorderItem>
      <BorderItem
        position="west"
        style={{
          marginTop: "calc(var(--salt-spacing-300) * 2)", // Margin should be the height of the header
          position: "fixed",
        }}
      >
        <aside style={{ width: "250px" }}>
          <nav>
            <StackLayout
              gap="var(--salt-size-border)"
              as="ul"
              style={{ listStyle: "none", margin: 0, padding: 0 }}
            >
              {navigationData.map((item) => (
                <RecursiveNavItem item={item} />
              ))}
            </StackLayout>
          </nav>
        </aside>
      </BorderItem>
      <BorderItem
        position="center"
        style={{
          marginTop: "calc(var(--salt-spacing-300) * 2)",
          marginLeft: "250px",
        }}
      >
        <Item />
        <Item />
        <Item />
        <Item />
      </BorderItem>
    </BorderLayout>
  );
};

Nested.parameters = {
  layout: "fullscreen",
};
