import {
  Button,
  SegmentedButtonGroup,
  type SegmentedButtonGroupProps,
  StackLayout,
} from "@salt-ds/core";
import { CallIcon, ChatGroupIcon, MessageIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer } from "docs/components";

export default {
  title: "Core/Segmented Button Group/Segmented Button Group QA",
  component: SegmentedButtonGroup,
} as Meta<typeof SegmentedButtonGroup>;

export const Default: StoryFn<SegmentedButtonGroupProps> = () => {
  return (
    <QAContainer>
      <StackLayout>
        <StackLayout>
          <SegmentedButtonGroup>
            <Button sentiment="accented"> Button </Button>
            <Button sentiment="accented"> Button </Button>
            <Button sentiment="accented"> Button </Button>
          </SegmentedButtonGroup>
          <SegmentedButtonGroup>
            <Button> Button </Button>
            <Button> Button </Button>
            <Button> Button </Button>
          </SegmentedButtonGroup>
          <SegmentedButtonGroup>
            <Button appearance="transparent"> Button </Button>
            <Button appearance="transparent"> Button </Button>
            <Button appearance="transparent"> Button </Button>
          </SegmentedButtonGroup>
        </StackLayout>
      </StackLayout>
    </QAContainer>
  );
};

Default.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        theme: "legacy",
      },
      themeNext: {
        theme: "brand",
      },
    },
  },
};

export const Icons: StoryFn<SegmentedButtonGroupProps> = () => {
  return (
    <QAContainer>
      <StackLayout>
        <SegmentedButtonGroup>
          <Button sentiment="accented">
            <MessageIcon />
          </Button>
          <Button sentiment="accented">
            <ChatGroupIcon />
          </Button>
          <Button sentiment="accented">
            <CallIcon />
          </Button>
        </SegmentedButtonGroup>
        <SegmentedButtonGroup>
          <Button>
            <MessageIcon />
          </Button>
          <Button>
            <ChatGroupIcon />
          </Button>
          <Button>
            <CallIcon />
          </Button>
        </SegmentedButtonGroup>
        <SegmentedButtonGroup>
          <Button appearance="transparent">
            <MessageIcon />
          </Button>
          <Button appearance="transparent">
            <ChatGroupIcon />
          </Button>
          <Button appearance="transparent">
            <CallIcon />
          </Button>
        </SegmentedButtonGroup>
      </StackLayout>
    </QAContainer>
  );
};

Icons.parameters = {
  chromatic: { disableSnapshot: false },
};
