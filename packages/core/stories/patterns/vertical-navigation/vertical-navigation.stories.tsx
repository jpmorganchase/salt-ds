import { FC, ReactNode, useEffect, useState } from "react";
import {
  Button,
  FlexItem,
  FlexLayout,
  StackLayout,
  BorderLayout,
  BorderItem,
  NavigationItem,
  useResponsiveProp,
  Text,
  Drawer,
} from "@salt-ds/core";
import {
  SymphonyIcon,
  StackoverflowIcon,
  GithubIcon,
  MenuIcon,
  CloseIcon,
  NotificationIcon,
} from "@salt-ds/icons";
import { Meta } from "@storybook/react";
import { AppHeader } from "packages/lab/src";

export default {
  title: "Patterns/Vertical Navigation",
} as Meta;

interface NavigationItemData {
  name: string;
  href?: string;
  children?: NavigationItemData[];
  level?: number;
}

export const VerticalNavigation = () => {
  const navigationData = [
    { name: "Overview", href: "" },
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
    if (expanded.includes(item.name)) {
      setExpanded(expanded.filter((expanded) => expanded !== item.name));
    } else {
      setExpanded([...expanded, item.name]);
    }
  };

  const isParentOfActiveItem = (
    children: NavigationItemData[],
    activeName: string
  ): boolean => {
    return children.some((child: NavigationItemData) => {
      if (child.name === activeName) {
        return true;
      }
      if (child.children) {
        return isParentOfActiveItem(child.children, activeName);
      }
      return false;
    });
  };

  const RecursiveNavItem: FC<{ item: NavigationItemData }> = ({ item }) => {
    return (
      <li style={{ listStyle: "none" }}>
        <NavigationItem
          active={active === item.name}
          blurActive={
            item.children && !expanded.includes(item.name)
              ? isParentOfActiveItem(item.children, active)
              : false
          }
          key={item.name}
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
        <header
          style={{
            position: "fixed",
            padding: "var(--salt-spacing-300)",
            margin: "var(--salt-spacing-100)",
            backgroundColor: "var(--salt-color-gray-10",
            width: "100%",
            zIndex: "var(--salt-zIndex-appHeader)",
          }}
        />
      </BorderItem>
      <BorderItem
        position="west"
        style={{
          marginTop: "calc(var(--salt-spacing-400) * 2)",
          position: "fixed",
        }}
      >
        <nav style={{ width: "250px" }}>
          {navigationData.map((item) => (
            <RecursiveNavItem item={item} />
          ))}
        </nav>
      </BorderItem>
      <BorderItem
        position="center"
        style={{
          marginTop: "calc(var(--salt-spacing-400) * 2)",
          marginLeft: "250px",
        }}
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            style={{
              padding: "var(--salt-spacing-400)",
              margin: "var(--salt-spacing-400)",
              backgroundColor: "var(--salt-color-gray-10",
            }}
          />
        ))}
      </BorderItem>
      <BorderItem position="south">
        <div
          style={{
            padding: "var(--salt-spacing-200)",
            margin: "var(--salt-spacing-200)",
            backgroundColor: "var(--salt-color-gray-10",
          }}
        >
          <Text>Footer</Text>
        </div>
      </BorderItem>
    </BorderLayout>
  );
};

VerticalNavigation.parameters = {
  layout: "fullscreen",
};
