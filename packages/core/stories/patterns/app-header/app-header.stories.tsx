import {
  BorderItem,
  BorderLayout,
  Button,
  Drawer,
  FlexItem,
  FlexLayout,
  NavigationItem,
  StackLayout,
  Text,
  Tooltip,
  useResponsiveProp,
} from "@salt-ds/core";
import {
  CloseIcon,
  GithubIcon,
  MenuIcon,
  StackoverflowIcon,
  SymphonyIcon,
} from "@salt-ds/icons";
import type { Meta } from "@storybook/react-vite";
import { type FC, type ReactNode, useEffect, useState } from "react";
import logo from "../../assets/logo.svg";

export default {
  title: "Patterns/App Header",
} as Meta;

const DesktopAppHeader: FC<{
  items?: string[];
  utilities?: { icon: ReactNode; key: string }[];
  showNavigation?: boolean;
}> = ({ items, utilities, showNavigation = true }) => {
  const [active, setActive] = useState(items?.[0]);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const setScroll = () => {
      setOffset(window.scrollY);
    };

    window.addEventListener("scroll", setScroll);
    return () => {
      window.removeEventListener("scroll", setScroll);
    };
  }, []);

  return (
    <header>
      <FlexLayout
        style={{
          minHeight: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
          paddingLeft: "var(--salt-spacing-300)",
          paddingRight: "var(--salt-spacing-300)",
          backgroundColor: "var(--salt-container-primary-background)",
          position: "fixed",
          width: "100%",
          boxShadow:
            offset > 0 ? "var(--salt-overlayable-shadow-scroll)" : "none",
          borderBottom:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
        }}
        justify="space-between"
        gap={3}
      >
        <FlexItem align="center">
          <StackLayout direction="row" gap={2} align="center">
            <img
              alt="logo"
              src={logo}
              style={{
                display: "block",
                height: "calc(var(--salt-size-base) - var(--salt-spacing-150))",
              }}
            />
            <Text style={{ fontWeight: "var(--salt-text-fontWeight-strong)" }}>
              Atlas
            </Text>
          </StackLayout>
        </FlexItem>
        {showNavigation ? (
          <nav aria-label="Primary">
            <ul
              style={{
                display: "flex",
                listStyle: "none",
                padding: "0",
                margin: "0",
              }}
            >
              {items?.map((item) => (
                <li key={item}>
                  <NavigationItem
                    active={active === item}
                    href="#"
                    onClick={() => setActive(item)}
                  >
                    {item}
                  </NavigationItem>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <FlexItem />
        )}
        <FlexItem align="center">
          <StackLayout direction="row" gap={1}>
            {utilities?.map((utility) => (
              <Tooltip
                key={utility.key}
                content={utility.key}
                placement="bottom"
              >
                <Button appearance="transparent" aria-label={utility.key}>
                  {utility.icon}
                </Button>
              </Tooltip>
            ))}
          </StackLayout>
        </FlexItem>
      </FlexLayout>
    </header>
  );
};

const MobileAppHeader: FC<{
  items?: string[];
  utilities?: { icon: ReactNode; key: string }[];
}> = ({ items, utilities }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState(items?.[0]);

  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const setScroll = () => {
      setOffset(window.scrollY);
    };

    window.addEventListener("scroll", setScroll);
    return () => {
      window.removeEventListener("scroll", setScroll);
    };
  }, []);

  const handleClick = (item: string) => {
    setActive(item);
    setDrawerOpen(false);
  };

  return (
    <header>
      <StackLayout
        direction="row"
        gap={3}
        style={{
          width: "100%",
          height: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
          backgroundColor: "var(--salt-container-primary-background)",
          zIndex: "calc(var(--salt-zIndex-drawer) + 1)",
          position: "fixed",
          borderBottom:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
          boxShadow: offset > 0 ? "var(--salt-shadow-1)" : "none",
        }}
      >
        <FlexItem
          style={{
            justifyContent: "center",
            display: "flex",
            paddingLeft: "var(--salt-spacing-100)",
          }}
        >
          {!drawerOpen && (
            <Button
              onClick={() => setDrawerOpen(true)}
              style={{ alignSelf: "center" }}
              appearance="transparent"
              aria-label="Open navigation menu"
            >
              <MenuIcon aria-hidden />
            </Button>
          )}
          {drawerOpen && (
            <Button
              onClick={() => setDrawerOpen(false)}
              style={{ alignSelf: "center" }}
              appearance="transparent"
              aria-label="Close navigation menu"
            >
              <CloseIcon aria-hidden />
            </Button>
          )}
        </FlexItem>
        <FlexItem align="center">
          <StackLayout direction="row" gap={2} align="center">
            <img
              alt="logo"
              src={logo}
              style={{
                display: "block",
                height: "calc(var(--salt-size-base) - var(--salt-spacing-150))",
              }}
            />
            <Text style={{ fontWeight: "var(--salt-text-fontWeight-strong)" }}>
              Atlas
            </Text>
          </StackLayout>
        </FlexItem>
      </StackLayout>
      <Drawer
        style={{
          paddingTop: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
          paddingLeft: "0",
        }}
        open={drawerOpen}
        onOpenChange={() => {
          if (drawerOpen) {
            setDrawerOpen(false);
          }
        }}
      >
        <nav aria-label="Primary">
          <ul style={{ listStyle: "none", padding: "0" }}>
            {items?.map((item) => (
              <li key={item}>
                <NavigationItem
                  orientation="vertical"
                  active={active === item}
                  href="#"
                  onClick={() => {
                    handleClick(item);
                  }}
                >
                  {item}
                </NavigationItem>
              </li>
            ))}
            {utilities?.map((utility) => (
              <li key={utility.key}>
                <NavigationItem
                  orientation="vertical"
                  href="#"
                  onClick={() => {
                    setDrawerOpen(false);
                  }}
                >
                  {utility.icon}
                  {utility.key}
                </NavigationItem>
              </li>
            ))}
          </ul>
        </nav>
      </Drawer>
    </header>
  );
};

export const AppHeader = () => {
  const isMobile = useResponsiveProp({ xs: true, sm: false }, false);

  const items = ["Home", "About", "Services", "Contact", "Blog"];

  const utilities = [
    {
      icon: <SymphonyIcon aria-hidden />,
      key: "Symphony",
    },
    {
      icon: <StackoverflowIcon aria-hidden />,
      key: "Stack Overflow",
    },
    {
      icon: <GithubIcon aria-hidden />,
      key: "GitHub",
    },
  ];

  return (
    <BorderLayout>
      <BorderItem position="north">
        {isMobile ? (
          <MobileAppHeader items={items} utilities={utilities} />
        ) : (
          <DesktopAppHeader items={items} utilities={utilities} />
        )}
      </BorderItem>
      <BorderItem
        style={{
          marginTop: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
        }}
        position="center"
      >
        {Array.from({ length: 12 }, (_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
            key={index}
            style={{
              padding: "var(--salt-spacing-400)",
              margin: "var(--salt-spacing-400)",
              backgroundColor: "var(--salt-container-secondary-background)",
            }}
          />
        ))}
      </BorderItem>
      <BorderItem position="south">
        <div
          style={{
            padding: "var(--salt-spacing-200)",
            margin: "var(--salt-spacing-200)",
            backgroundColor: "var(--salt-container-secondary-background)",
          }}
        >
          <Text>Footer</Text>
        </div>
      </BorderItem>
    </BorderLayout>
  );
};

AppHeader.parameters = {
  layout: "fullscreen",
};

export const HeaderOnly = () => {
  const items = ["Home", "About", "Services", "Contact"];
  const utilities = [
    { icon: <SymphonyIcon aria-hidden />, key: "Symphony" },
    { icon: <GithubIcon aria-hidden />, key: "GitHub" },
  ];

  return (
    <BorderLayout>
      <BorderItem position="north">
        <DesktopAppHeader items={items} utilities={utilities} />
      </BorderItem>
      <BorderItem
        style={{
          marginTop: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
        }}
        position="center"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            style={{
              padding: "var(--salt-spacing-400)",
              margin: "var(--salt-spacing-400)",
              backgroundColor: "var(--salt-container-secondary-background)",
            }}
          />
        ))}
      </BorderItem>
    </BorderLayout>
  );
};

HeaderOnly.parameters = {
  layout: "fullscreen",
};

export const HeaderWithVerticalNavigation = () => {
  const items = ["Home", "About", "Services", "Contact"];
  const utilities = [
    { icon: <StackoverflowIcon aria-hidden />, key: "Stack Overflow" },
    { icon: <GithubIcon aria-hidden />, key: "GitHub" },
  ];
  const navItems = ["Overview", "Data analysis", "Reports", "Settings"];
  const [active, setActive] = useState(navItems[0]);

  return (
    <BorderLayout>
      <BorderItem position="north">
        <DesktopAppHeader
          items={items}
          utilities={utilities}
          showNavigation={false}
        />
      </BorderItem>
      <BorderItem
        position="west"
        style={{
          marginTop: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
          width: "240px",
          padding: "var(--salt-spacing-200)",
        }}
      >
        <aside>
          <nav aria-label="Primary">
            <StackLayout
              as="ul"
              gap="var(--salt-spacing-fixed-100)"
              style={{ listStyle: "none", margin: 0, padding: 0 }}
            >
              {navItems.map((item) => (
                <li key={item} style={{ listStyle: "none" }}>
                  <NavigationItem
                    active={active === item}
                    href="#"
                    orientation="vertical"
                    onClick={(event) => {
                      event.preventDefault();
                      setActive(item);
                    }}
                  >
                    {item}
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
          marginTop: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
        }}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            style={{
              padding: "var(--salt-spacing-400)",
              margin: "var(--salt-spacing-400)",
              backgroundColor: "var(--salt-container-secondary-background)",
            }}
          />
        ))}
      </BorderItem>
    </BorderLayout>
  );
};

HeaderWithVerticalNavigation.parameters = {
  layout: "fullscreen",
};
