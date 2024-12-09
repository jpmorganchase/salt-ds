import {
  BorderItem,
  BorderLayout,
  Button,
  FlexItem,
  FlexLayout,
  NavigationItem,
  SplitLayout,
  StackLayout,
} from "@salt-ds/core";
import { GithubIcon, StackoverflowIcon, SymphonyIcon } from "@salt-ds/icons";
import { SkipLink } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { useEffect, useState } from "react";

export default {
  title: "Lab/Skip Link",
  component: SkipLink,
} as Meta<typeof SkipLink>;

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

const DefaultStory: StoryFn<typeof SkipLink> = (args) => {
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

  const [activeHeaderNav, setActiveHeaderNav] = useState(headerItems[0]);
  const [offset, setOffset] = useState(0);

  const setScroll = () => {
    setOffset(window.scrollY);
  };

  useEffect(() => {
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
                "var(--salt-size-border) var(--salt-container-borderStyle) var(--salt-separable-primary-borderColor)",
            }}
            justify="space-between"
            gap={3}
          >
            <FlexItem align="center">
              Click here and press the Tab key to see the Skip Link
            </FlexItem>
            <nav>
              <SkipLink {...args}>Skip to main content</SkipLink>
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
        position="center"
        style={{
          margin: "calc(var(--salt-spacing-300) * 2)",
        }}
      >
        <article id="main">
          <Item />
          <Item />
          <Item />
        </article>
        <SplitLayout endItem={<Button>Next</Button>} />
      </BorderItem>
    </BorderLayout>
  );
};

export const Default = DefaultStory.bind({});
Default.args = {
  target: "main",
};
Default.parameters = {
  layout: "fullscreen",
};
