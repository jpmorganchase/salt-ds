import {
  BorderItem,
  BorderLayout,
  Link,
  StackLayout,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
} from "@salt-ds/core";
import {
  LineChartIcon,
  NotificationIcon,
  PinIcon,
  ReceiptIcon,
  SearchIcon,
  UserIcon,
} from "@salt-ds/icons";
import { useState } from "react";

export const Item = () => {
  return (
    <div
      style={{
        padding: "calc(var(--salt-spacing-400)*4)",
        backgroundColor: "var(--salt-container-tertiary-background)",
      }}
    />
  );
};

export const Header = () => {
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
