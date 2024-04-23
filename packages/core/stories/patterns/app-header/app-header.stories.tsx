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
} from "@salt-ds/icons";
import { Meta } from "@storybook/react";
import logo from "../../assets/logo.svg";

export default {
  title: "Patterns/App Header",
} as Meta;

export const AppHeader = () => {
  const [offset, setOffset] = useState(0);
  const isMobile = useResponsiveProp({ xs: true, sm: false }, false);

  const setScroll = () => {
    setOffset(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", setScroll);
    return () => {
      window.removeEventListener("scroll", setScroll);
    };
  }, []);

  const DesktopAppHeader: FC<{
    items?: string[];
    utilities?: { icon: ReactNode; key: string }[];
  }> = ({ items, utilities }) => {
    const [active, setActive] = useState(items?.[0]);

    return (
      <header>
        <FlexLayout
          style={{
            paddingLeft: "var(--salt-spacing-300)",
            paddingRight: "var(--salt-spacing-300)",
            backgroundColor: "var(--salt-container-primary-background)",
            position: "fixed",
            width: "100%",
            boxShadow:
              offset > 0 ? "var(--salt-overlayable-shadow-scroll)" : "none",
            borderBottom:
              "var(--salt-size-border) var(--salt-container-borderStyle) var(--salt-separable-primary-borderColor)",
          }}
          justify="space-between"
          gap={3}
        >
          <FlexItem align="center">
            <img
              alt="logo"
              src={logo}
              style={{
                display: "block",
                height: "calc(var(--salt-size-base) - var(--salt-spacing-150))",
              }}
            />
          </FlexItem>
          <nav>
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
          <FlexItem align="center">
            <StackLayout direction="row" gap={1}>
              {utilities?.map((utility) => (
                <Button key={utility.key} variant="secondary">
                  {utility.icon}
                </Button>
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
              "var(--salt-size-border) var(--salt-separable-borderStyle) var(--salt-separable-primary-borderColor)",
            boxShadow: offset > 0 ? "var(--salt-shadow-1)" : "none",
          }}
        >
          <FlexItem
            style={{
              justifyContent: "center",
              display: "flex",
              // height: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
              paddingLeft: "var(--salt-spacing-100)",
              // width: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
            }}
          >
            {!drawerOpen && (
              <Button
                onClick={() => setDrawerOpen(true)}
                style={{ alignSelf: "center" }}
                variant="secondary"
              >
                <MenuIcon />
              </Button>
            )}
            {drawerOpen && (
              <Button
                onClick={() => setDrawerOpen(false)}
                style={{ alignSelf: "center" }}
                variant="secondary"
              >
                <CloseIcon />
              </Button>
            )}
          </FlexItem>
          <FlexItem align="center">
            <img
              alt="logo"
              src={logo}
              style={{
                display: "block",
                height: "calc(var(--salt-size-base) - var(--salt-spacing-150))",
              }}
            />
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
          <nav>
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

  const items = ["Home", "About", "Services", "Contact", "Blog"];

  const utilities = [
    {
      icon: <SymphonyIcon />,
      key: "Symphony",
    },
    {
      icon: <StackoverflowIcon />,
      key: "Stack Overflow",
    },
    {
      icon: <GithubIcon />,
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

AppHeader.parameters = {
  layout: "fullscreen",
};
