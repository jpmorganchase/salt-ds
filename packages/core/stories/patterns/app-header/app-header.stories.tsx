import { FC, HTMLAttributes, useState } from "react";
import {
  Button,
  FlexItem,
  FlexLayout,
  StackLayout,
  BorderLayout,
  BorderItem,
  useResponsiveProp,
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
     * Items included in the App Header
     */
    items?: string[];
  }

  const AppHeader: FC<AppHeaderProps> = ({ items }) => {
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
          <FlexLayout
            style={{ height: "44px" }}
            justify="space-between"
            gap={3}
          >
            <StackLayout
              direction="row"
              style={{
                width: "100%",
                backgroundColor: "var(--salt-container-primary-background)",
                zIndex: 999999999,
                paddingRight: "1em",
                borderBottom:
                  "var(--salt-size-border) var(--salt-container-borderStyle) var(--salt-container-secondary-borderColor)",
              }}
            >
              <FlexItem
                style={{
                  justifyContent: "center",
                  display: "flex",
                  height: "44px",
                  width: "44px",
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
              style={{ paddingTop: "44px", paddingLeft: "0" }}
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
            </Drawer>
          </FlexLayout>
        ) : (
          // Desktop Header
          <FlexLayout
            style={{ height: "44px", paddingLeft: "1em", paddingRight: "1em" }}
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
                <Button variant="secondary">
                  <SymphonyIcon />
                </Button>
                <Button variant="secondary">
                  <StackoverflowIcon />
                </Button>
                <Button variant="secondary">
                  <GithubIcon />
                </Button>
              </StackLayout>
            </FlexItem>
          </FlexLayout>
        )}
      </header>
    );
  };

  const items = ["Home", "About", "Services", "Contact", "Blog"];

  return (
    <BorderLayout style={{ height: "100vh" }}>
      <BorderItem position="north">
        <AppHeader items={items} />
      </BorderItem>
      <BorderItem
        style={{ backgroundColor: "var(--salt-color-teal-30)", padding: "1em" }}
        position="west"
      >
        <p>Left content</p>
      </BorderItem>
      <BorderItem
        style={{
          backgroundColor: "var(--salt-color-purple-30)",
          padding: "1em",
        }}
        position="center"
      >
        <p>right content</p>
      </BorderItem>
      <BorderItem
        style={{
          backgroundColor: "var(--salt-color-orange-30)",
          padding: "1em",
        }}
        position="south"
      >
        <p>footer</p>
      </BorderItem>
    </BorderLayout>
  );
};

AppHeaderInPage.parameters = {
  layout: "fullscreen",
};
