import {
  BorderItem,
  BorderLayout,
  Button,
  FlexItem,
  FlexLayout,
  NavigationItem,
  StackLayout,
} from "@salt-ds/core";
import { GithubIcon, StackoverflowIcon, SymphonyIcon } from "@salt-ds/icons";
import type { Meta } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import logo from "../../assets/logo.svg";

export default {
  title: "Patterns/Navigation",
} as Meta;

const Item = () => {
  return (
    <div
      style={{
        padding: "calc(var(--salt-spacing-400)*4)",
        margin: "var(--salt-spacing-400)",
        backgroundColor: "var(--salt-container-secondary-background)",
      }}
    />
  );
};

export const Navigation = () => {
  const verticalNavigationData = [
    {
      name: "Overview",
      href: "#",
    },
    {
      name: "Data analysis",
      href: "#",
    },
    {
      name: "Market monitor",
      href: "#",
    },
    {
      name: "Checks",
      href: "#",
    },
    {
      name: "Operations",
      href: "#",
    },
    {
      name: "Trades",
      href: "#",
    },
  ];

  const headerItems = ["Home", "Transactions", "FX", "Credit Manager"];

  const headerUtilities = [
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
  const [activeVerticalNav, setActiveVerticalNav] = useState(
    verticalNavigationData[0].name,
  );
  const [activeHeaderNav, setActiveHeaderNav] = useState(headerItems[0]);
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
    <BorderLayout>
      <BorderItem position="north">
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
                "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
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
                  height:
                    "calc(var(--salt-size-base) - var(--salt-spacing-150))",
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
                {headerItems?.map((item) => (
                  <li key={item}>
                    <NavigationItem
                      active={activeHeaderNav === item}
                      href="#"
                      onClick={(event) => {
                        // prevent default to avoid navigation in storybook example
                        event.preventDefault();
                        setActiveHeaderNav(item);
                      }}
                    >
                      {item}
                    </NavigationItem>
                  </li>
                ))}
              </ul>
            </nav>
            <FlexItem align="center">
              <StackLayout direction="row" gap={1}>
                {headerUtilities?.map((utility) => (
                  <Button key={utility.key} appearance="transparent">
                    {utility.icon}
                  </Button>
                ))}
              </StackLayout>
            </FlexItem>
          </FlexLayout>
        </header>
      </BorderItem>
      <BorderItem
        position="west"
        style={{
          marginTop: "calc(var(--salt-spacing-300) * 2)",
          // Margin should be the height of the header
          position: "fixed",
        }}
      >
        <aside
          style={{
            width: "250px",
          }}
        >
          <nav>
            <StackLayout
              gap="var(--salt-spacing-fixed-100)"
              as="ul"
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
            >
              {verticalNavigationData.map((item) => (
                <li
                  style={{
                    listStyle: "none",
                  }}
                  key={item.name}
                >
                  <NavigationItem
                    active={activeVerticalNav === item.name}
                    href={item.href}
                    orientation="vertical"
                    onClick={(event) => {
                      // prevent default to avoid navigation in storybook example
                      event.preventDefault();
                      setActiveVerticalNav(item.name);
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

Navigation.parameters = {
  layout: "fullscreen",
};
