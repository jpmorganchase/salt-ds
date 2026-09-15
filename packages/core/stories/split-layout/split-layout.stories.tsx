import {
  Button,
  FLEX_ALIGNMENT_BASE,
  FlowLayout,
  SplitLayout,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import "../layout/layout.stories.css";
import {
  ChatIcon,
  InfoIcon,
  SettingsIcon,
  TearOutIcon,
  VisibleIcon,
} from "@salt-ds/icons";

export default {
  title: "Core/Layout/Split Layout",
  component: SplitLayout,
  argTypes: {
    as: { type: "string" },
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
    direction: {
      options: ["row", "column", "row-reverse", "column-reverse"],
      control: { type: "select" },
    },
    gap: {
      type: "number",
    },
    endItem: { control: false },
    startItem: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: "30vw", minHeight: "350px", display: "flex" }}>
        {Story()}
      </div>
    ),
  ],
} as Meta<typeof SplitLayout>;

const startItem = (
  <FlowLayout className="layout-container" align="baseline">
    {Array.from({ length: 3 }, (_, index) => (
      <div key={index}>
        <Text>Item {index + 1}</Text>
      </div>
    ))}
  </FlowLayout>
);
const endItem = (
  <FlowLayout align="baseline">
    <div className="layout-content-right">
      <Text>Item 4</Text>
    </div>
    <div className="layout-content-right">
      <Text>Item 5</Text>
    </div>
  </FlowLayout>
);

const startButtonsItem = (
  <FlowLayout gap={1}>
    <Button appearance="bordered" style={{ marginRight: "auto" }}>
      My privacy settings
    </Button>
  </FlowLayout>
);

const endButtonsItem = (
  <FlowLayout gap={1}>
    <Button sentiment="accented" appearance="bordered">
      Cancel
    </Button>
    <Button sentiment="accented">Accept</Button>
  </FlowLayout>
);

const topItem = (
  <StackLayout>
    <Button appearance="transparent" aria-label="info">
      <InfoIcon aria-hidden />
    </Button>
    <Button appearance="transparent" aria-label="chat">
      <ChatIcon aria-hidden />
    </Button>
    <Button appearance="transparent" aria-label="visible">
      <VisibleIcon aria-hidden />
    </Button>
  </StackLayout>
);
const bottomItem = (
  <StackLayout>
    <Button appearance="transparent" aria-label="settings">
      <SettingsIcon aria-hidden />
    </Button>
    <Button appearance="transparent" aria-label="open in another tab">
      <TearOutIcon aria-hidden />
    </Button>
  </StackLayout>
);

const DefaultSplitLayoutStory: StoryFn<typeof SplitLayout> = (args) => (
  <SplitLayout {...args} />
);

export const Default = DefaultSplitLayoutStory.bind({});
Default.args = {
  startItem: startItem,
  endItem: endItem,
  direction: { xs: "column", sm: "row" },
};

export const EndOnly = DefaultSplitLayoutStory.bind({});
EndOnly.args = {
  endItem: endItem,
};

export const SimpleUsage = DefaultSplitLayoutStory.bind({});
SimpleUsage.args = {
  startItem: startButtonsItem,
  endItem: endButtonsItem,
  direction: { xs: "column", sm: "row" },
};

export const Vertical = DefaultSplitLayoutStory.bind({});
Vertical.args = {
  align: "center",
  startItem: topItem,
  endItem: bottomItem,
  direction: "column",
};
