import {
  Avatar,
  FlexItem,
  FlexLayout,
  Logo,
  MenuButton,
  SEPARATOR_VARIANTS,
  SplitLayout,
} from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import PlaceholderLogo from "docs/assets/placeholder.svg";
import {
  Button,
} from "@brandname/core";

import React from "react";
import {
  ChatGroupIcon,
  ExportIcon,
  ImportIcon,
  NotificationIcon,
  SearchIcon
} from "@brandname/icons";

export default {
  title: "Layout/SplitLayout",
  component: SplitLayout,
} as ComponentMeta<typeof SplitLayout>;

const flexItemStyles = { background: "#e0ffff85", padding: "1rem" };
const splitLayoutStyle = {
  background: "lightblue",
  border: "solid 1px lightgrey",
};

const Template: ComponentStory<typeof SplitLayout> = (args) => {
  return (
    <SplitLayout style={splitLayoutStyle} {...args}>
      <FlexItem style={flexItemStyles} {...args}>
        <p>Flex Item 1</p>
      </FlexItem>
      <FlexItem style={flexItemStyles} {...args}>
        <p>Flex Item 2</p>
      </FlexItem>
    </SplitLayout>
  );
};
export const ToolkitSplitLayout = Template.bind({});
ToolkitSplitLayout.args = {
  separator: "vertical-center",
};

ToolkitSplitLayout.argTypes = {
  reverse: {
    control: { type: "boolean" },
  },
  separator: {
    options: SEPARATOR_VARIANTS,
    control: { type: "select" },
  },
};

const initialSource = {
  menuItems: [
    {
      title: "Level 1 Menu Item 1",
      menuItems: [
        {
          title: "Level 2 Menu Item 1.1",
        },
      ],
    },
    {
      title: "Level 1 Menu Item 2",
    },
    {
      title: "Level 1 Menu Item 3",
      menuItems: [
        {
          title: "Level 2 Menu Item 3.1",
        },
        {
          title: "Level 2 Menu Item 3.2",
        },
        {
          title: "Level 2 Menu Item 3.3",
          menuItems: [
            {
              title: "Level 3 Menu Item 3.3.1",
            },
          ],
        },
      ],
    },
  ],
};
const HeaderExample: ComponentStory<typeof SplitLayout> = (args) => {
  return (
    <SplitLayout style={{ height: "30px" }} {...args}>
      <FlexItem style={{}}>
        <Logo appTitle="layouts" src={PlaceholderLogo} />
      </FlexItem>
      <FlexItem style={{ minWidth: "max-content" }}>
        <Button variant="secondary">
          <SearchIcon />
        </Button>
        <Button variant="secondary">
          <ChatGroupIcon />
        </Button>
        <Button variant="secondary">
          <NotificationIcon />
        </Button>
      </FlexItem>
      <FlexItem>
        <FlexLayout alignItems={"center"} wrap={"nowrap"}>
          <Avatar size="small" style={{ display: "inline-flex" }} />
          <MenuButton CascadingMenuProps={{ initialSource }}>
            Name Lastname
          </MenuButton>
        </FlexLayout>
      </FlexItem>
    </SplitLayout>
  );
};
export const HeaderWithSplitLayout = HeaderExample.bind({});
HeaderWithSplitLayout.args = {
  separator: "vertical-end",
  stretchedItem: 0,
};

HeaderWithSplitLayout.argTypes = {
  reverse: {
    control: { type: "boolean" },
  },
  separator: {
    options: SEPARATOR_VARIANTS,
    control: { type: "select" },
  },
};
const ButtonsExample: ComponentStory<typeof SplitLayout> = (args) => {
  return (
    <SplitLayout style={{ height: "30px" }} {...args}>
      <Button variant="secondary">
        <ExportIcon style={{ marginRight: 5 }} />
        Export
      </Button>
      <Button variant="secondary">
        <ImportIcon style={{ marginRight: 5 }} />
        Import
      </Button>
      <Button variant="cta">Save</Button>
      <Button>Cancel</Button>
    </SplitLayout>
  );
};
export const ButtonBarInSplitLayout = ButtonsExample.bind({});
ButtonBarInSplitLayout.args = {
  separator: "empty-space",
  stretchedItem: 1,
};

ButtonBarInSplitLayout.argTypes = {
  reverse: {
    control: { type: "boolean" },
  },
  separator: {
    options: SEPARATOR_VARIANTS,
    control: { type: "select" },
  },
};
