import { GithubIcon, StackoverflowIcon, SymphonyIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";
import "./skip-link.stories.css";
import {
  BorderItem,
  BorderLayout,
  Button,
  Card,
  FlexItem,
  FlexLayout,
  GridLayout,
  H1,
  H2,
  H4,
  NavigationItem,
  SkipLink,
  SplitLayout,
  StackLayout,
  Text,
} from "@salt-ds/core";

export default {
  title: "Core/Skip Link",
  component: SkipLink,
} as Meta<typeof SkipLink>;

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
  const cardHeaders = [
    "Economic trends",
    "Machine learning",
    "Financial conditions",
    "Balance sheets",
    "Outlook hub",
    "Trading strategies",
    "Emerging markets",
    "Support tools",
    "Index",
  ];

  const [activeHeaderNav, setActiveHeaderNav] = useState(headerItems[0]);

  return (
    <BorderLayout>
      <BorderItem position="north" sticky className="app-header" as="header">
        <SkipLink {...args}>Skip to main content</SkipLink>
        <FlexLayout className="navbar" justify="space-between" gap={3}>
          <FlexItem align="center">
            <H4 style={{ margin: 0 }}>LOGO</H4>
          </FlexItem>
          <nav>
            <ul className="navigation">
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
      </BorderItem>
      <BorderItem position="center" className="center">
        <StackLayout as="article">
          <StackLayout as="section">
            <H1 id={args.targetId} className="header">
              Explore our offering
            </H1>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam,
              consequuntur culpa dolor excepturi fugit in ipsa iusto laudantium
              magnam minima necessitatibus odio qui quia repellendus sit tempore
              veniam. At, veritatis.
            </Text>
            <GridLayout columns={3}>
              {cardHeaders.map((title) => {
                return (
                  <Card key={title}>
                    <H2 styleAs="h4">{title}</H2>
                    <Text>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                      Aliquam, consequuntur culpa dolor excepturi.
                    </Text>
                    <Text>
                      Fugit in ipsa iusto laudantium magnam minima
                      necessitatibus odio qui quia repellendus sit tempore
                      veniam. At, veritatis.
                    </Text>
                  </Card>
                );
              })}
            </GridLayout>
          </StackLayout>
          <SplitLayout
            endItem={<Button appearance="bordered">See all themes</Button>}
          />
        </StackLayout>
        <Text className="help-text">
          Click here and press the Tab key to see the Skip Link
        </Text>
      </BorderItem>
    </BorderLayout>
  );
};

export const Default = DefaultStory.bind({});
Default.args = {
  targetId: "main",
};
Default.parameters = {
  layout: "fullscreen",
};
