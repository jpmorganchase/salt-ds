import { FC, HTMLAttributes, useState } from "react";
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

export const AppHeaderInPage = () => {
  interface AppHeaderProps extends HTMLAttributes<HTMLElement> {
    /**
     * Items included in the App Header navigation
     */
    items?: string[];
    /**
     * Utilities included in the App Header
     */
    utilities?: JSX.Element[];
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
                </ul>
              </nav>
              <StackLayout
                align="start"
                direction="column"
                gap={1}
                style={{ paddingLeft: "26px" }}
              >
                {utilities?.map((utility, index) => (
                  <StackLayout
                    gap={1}
                    align="center"
                    key={index}
                    direction="row"
                  >
                    {utility}
                    <Text>{utility.key}</Text>
                  </StackLayout>
                ))}
              </StackLayout>
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
                {utilities}
              </StackLayout>
            </FlexItem>
          </FlexLayout>
        )}
      </header>
    );
  };

  const items = ["Home", "About", "Services", "Contact", "Blog"];
  const utilities = [
    <Button key="Symphony" variant="secondary">
      <SymphonyIcon />
    </Button>,
    <Button key="Stack Overflow" variant="secondary">
      <StackoverflowIcon />
    </Button>,
    <Button key="GitHub" variant="secondary">
      <GithubIcon />
    </Button>,
  ];

  return (
    <BorderLayout>
      <BorderItem position="north">
        <AppHeader items={items} utilities={utilities} />
      </BorderItem>
      <BorderItem
        style={{
          backgroundColor: "var(--salt-color-purple-30)",
          padding: "1em",
          paddingTop:
            "var(--salt-size-border) var(--salt-container-borderStyle) var(--salt-container-secondary-borderColor)",
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

AppHeaderInPage.parameters = {
  layout: "fullscreen",
};
