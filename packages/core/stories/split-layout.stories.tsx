import {
  Button,
  FLEX_ALIGNMENT_BASE,
  FlowLayout,
  SplitLayout,
  StackLayout,
} from "@salt-ds/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./layout-stories.css";
import {
  ChatIcon,
  InfoIcon,
  SettingsIcon,
  TearOutIcon,
  VisibleIcon,
} from "@salt-ds/icons";

export default {
  title: "Core/Layout/SplitLayout",
  component: SplitLayout,
  argTypes: {
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
    as: {
      type: "string",
    },
    gap: {
      type: "number",
    },
    wrap: {
      type: "boolean",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: "30vw", minHeight: "700px" }}>{Story()}</div>
    ),
  ],
} as ComponentMeta<typeof SplitLayout>;

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
  <FlowLayout>
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

const DefaultSplitLayoutStory: ComponentStory<typeof SplitLayout> = (args) => (
  <SplitLayout {...args} />
);

export const DefaultSplitLayout = DefaultSplitLayoutStory.bind({});
DefaultSplitLayout.args = {
  startItem: startItem,
  endItem: endItem,
};

export const EndOnlySplitLayout = DefaultSplitLayoutStory.bind({});
EndOnlySplitLayout.args = {
  endItem: endItem,
  wrapAtBreakpoint: "xs",
};

export const SplitLayoutSimpleUsage = DefaultSplitLayoutStory.bind({});
SplitLayoutSimpleUsage.args = {
  startItem: startButtonsItem,
  endItem: endButtonsItem,
};

export const VerticalSplitLayout = DefaultSplitLayoutStory.bind({});
VerticalSplitLayout.args = {
  align: "center",
  startItem: topItem,
  endItem: bottomItem,
  direction: "column",
};
