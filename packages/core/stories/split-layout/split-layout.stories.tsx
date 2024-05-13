import {
  Button,
  FLEX_ALIGNMENT_BASE,
  FlowLayout,
  SplitLayout,
  StackLayout,
} from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
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
      options: ["row", "column"],
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
        <p>Item {index + 1}</p>
      </div>
    ))}
  </FlowLayout>
);
const endItem = (
  <FlowLayout align="baseline">
    <div className="layout-content-right">
      <p>Item 4</p>
    </div>
    <div className="layout-content-right">
      <p>Item 5</p>
    </div>
  </FlowLayout>
);

const startButtonsItem = (
  <FlowLayout gap={1}>
    <Button variant="cta">Button 1</Button>
    <Button variant="primary">Button 2</Button>
    <Button variant="secondary">Button 3</Button>
  </FlowLayout>
);

const endButtonsItem = (
  <FlowLayout gap={1}>
    <Button variant="cta">Button 4</Button>
    <Button variant="primary">Button 5</Button>
  </FlowLayout>
);

const topItem = (
  <StackLayout>
    <Button variant="secondary" aria-label="info">
      <InfoIcon aria-hidden />
    </Button>
    <Button variant="secondary" aria-label="chat">
      <ChatIcon aria-hidden />
    </Button>
    <Button variant="secondary" aria-label="visible">
      <VisibleIcon aria-hidden />
    </Button>
  </StackLayout>
);
const bottomItem = (
  <StackLayout>
    <Button variant="secondary" aria-label="settings">
      <SettingsIcon aria-hidden />
    </Button>
    <Button variant="secondary" aria-label="open in another tab">
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
