import {
  BorderItem,
  BorderLayout,
  Button,
  FlexItem,
  FlexLayout,
  H1,
  NavigationItem,
  SplitLayout,
  StackLayout,
} from "@salt-ds/core";
import { GithubIcon, StackoverflowIcon, SymphonyIcon } from "@salt-ds/icons";
import { SkipLink } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import "./skip-link.stories.css";

export default {
  title: "Lab/Skip Link",
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

  const [activeHeaderNav, setActiveHeaderNav] = useState(headerItems[0]);

  return (
    <BorderLayout>
      <BorderItem position="north">
        <header>
          <FlexLayout className="header" justify="space-between" gap={3}>
            <FlexItem align="center">
              Click here and press the Tab key to see the Skip Link
            </FlexItem>
            <nav>
              <SkipLink {...args}>Skip to main content</SkipLink>
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
        </header>
      </BorderItem>
      <BorderItem position="center" className="center">
        <article id="main" className="article">
          <H1>Explore our offering</H1>
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam,
              consequuntur culpa dolor excepturi fugit in ipsa iusto laudantium
              magnam minima necessitatibus odio qui quia repellendus sit tempore
              veniam. At, veritatis.
            </p>
          </section>
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
