import { FC, HTMLAttributes, ReactNode, useState } from "react";
import {
  Button,
  FlexItem,
  FlexLayout,
  StackLayout,
  BorderLayout,
  BorderItem,
  useResponsiveProp,
  Text,
} from "@salt-ds/core";
import { Drawer, NavigationItem } from "@salt-ds/lab";
import {
  SymphonyIcon,
  StackoverflowIcon,
  GithubIcon,
  MenuIcon,
  CloseIcon,
} from "@salt-ds/icons";
import { Meta } from "@storybook/react";

export default {
  title: "Patterns/App Header",
} as Meta;

export const AppHeader = () => {
  interface AppHeaderProps extends HTMLAttributes<HTMLElement> {
    /**
     * Items included in the App Header navigation
     */
    items?: string[];
    /**
     * Utilities included in the App Header
     */
    utilities?: { icon: ReactNode; label: string; key: string }[];
  }

  const AppHeader: FC<AppHeaderProps> = ({ items, utilities }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [active, setActive] = useState(items?.[0]);
    const isMobile = useResponsiveProp({ xs: true, sm: false }, false);

    const handleDrawerToggle = () => {
      setDrawerOpen(!drawerOpen);
    };

    return (
      <header>
        {isMobile ? (
          // Mobile Header
          <>
            <StackLayout
              direction="row"
              style={{
                width: "100%",
                backgroundColor: "var(--salt-container-primary-background)",
                zIndex: "calc(var(--salt-zIndex-drawer) + 1)",
                position: "fixed",
                inset: "0 0 auto 0",
                paddingRight: "1em",
                borderBottom:
                  "var(--salt-size-border) var(--salt-container-borderStyle) var(--salt-container-secondary-borderColor)",
              }}
            >
              <FlexItem
                style={{
                  justifyContent: "center",
                  display: "flex",
                  height:
                    "calc(var(--salt-size-base) + var(--salt-spacing-200))",
                  width:
                    "calc(var(--salt-size-base) + var(--salt-spacing-200))",
                  borderRight:
                    "var(--salt-size-border) var(--salt-container-borderStyle) var(--salt-container-secondary-borderColor)",
                }}
              >
                <Button
                  onClick={handleDrawerToggle}
                  variant={drawerOpen ? "primary" : "secondary"}
                  style={{ alignSelf: "center" }}
                >
                  {drawerOpen ? <CloseIcon /> : <MenuIcon />}
                </Button>
              </FlexItem>
              <FlexItem align="center">App logo</FlexItem>
            </StackLayout>
            <Drawer
              style={{
                paddingTop:
                  "calc(var(--salt-size-base) + var(--salt-spacing-200))",
                paddingLeft: "0",
              }}
              open={drawerOpen}
            >
              <nav>
                <ul style={{ listStyle: "none", padding: "0" }}>
                  {items?.map((item) => (
                    <li key={item}>
                      <NavigationItem
                        orientation="vertical"
                        active={active === item}
                        href="#"
                        onClick={() => setActive(item)}
                      >
                        {item}
                      </NavigationItem>
                    </li>
                  ))}
                  {utilities?.map((utility) => (
                    <li key={utility.key}>
                      <NavigationItem orientation="vertical" href="#">
                        {utility.icon}
                        {utility.label}
                      </NavigationItem>
                    </li>
                  ))}
                </ul>
              </nav>
            </Drawer>
          </>
        ) : (
          // Desktop Header
          <FlexLayout
            style={{
              height: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
              paddingLeft: "1em",
              paddingRight: "1em",
              backgroundColor: "var(--salt-container-primary-background)",
              position: "fixed",
              inset: "0 0 auto 0",
              borderBottom:
                "var(--salt-size-border) var(--salt-container-borderStyle) var(--salt-container-secondary-borderColor)",
            }}
            justify="space-between"
            gap={3}
          >
            <FlexItem align="center">App logo</FlexItem>
            <nav>
              <ul style={{ display: "flex", listStyle: "none", margin: "0" }}>
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
        )}
      </header>
    );
  };

  const items = ["Home", "About", "Services", "Contact", "Blog"];

  const utilities = [
    {
      icon: <SymphonyIcon />,
      label: "Symphony",
      key: "Symphony",
    },
    {
      icon: <StackoverflowIcon />,
      label: "Stack Overflow",
      key: "Stack Overflow",
    },
    {
      icon: <GithubIcon />,
      label: "GitHub",
      key: "GitHub",
    },
  ];

  return (
    <BorderLayout>
      <BorderItem position="north">
        <AppHeader items={items} utilities={utilities} />
      </BorderItem>
      <BorderItem
        style={{
          backgroundColor: "var(--salt-color-purple-30)",
          padding: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
          height: "120vh",
        }}
        position="center"
      >
        <p>Main content</p>
      </BorderItem>
      <BorderItem
        style={{
          backgroundColor: "var(--salt-color-orange-30)",
          padding: "1em",
        }}
        position="south"
      >
        <p>Footer</p>
      </BorderItem>
    </BorderLayout>
  );
};

AppHeader.parameters = {
  layout: "fullscreen",
};
