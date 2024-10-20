import {
  Button,
  SegmentedButtonGroup,
  type SegmentedButtonGroupProps,
  StackLayout,
  Tooltip,
} from "@salt-ds/core";
import { CallIcon, ChatGroupIcon, MessageIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Core/Segmented Button Group",
  component: SegmentedButtonGroup,
} as Meta<typeof SegmentedButtonGroup>;

export const Default: StoryFn<SegmentedButtonGroupProps> = () => {
  return (
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
  );
};

export const Icons: StoryFn<SegmentedButtonGroupProps> = () => {
  return (
    <StackLayout>
      <SegmentedButtonGroup>
        <Tooltip content="Message">
          <Button sentiment="accented" aria-label="Message">
            <MessageIcon aria-hidden />
          </Button>
        </Tooltip>
        <Tooltip content="Chat">
          <Button sentiment="accented" aria-label="Chat">
            <ChatGroupIcon aria-hidden />
          </Button>
        </Tooltip>
        <Tooltip content="Call">
          <Button sentiment="accented" aria-label="Call">
            <CallIcon aria-hidden />
          </Button>
        </Tooltip>
      </SegmentedButtonGroup>
      <SegmentedButtonGroup>
        <Tooltip content="Message">
          <Button aria-label="Message">
            <MessageIcon aria-hidden />
          </Button>
        </Tooltip>
        <Tooltip content="Chat">
          <Button aria-label="Chat">
            <ChatGroupIcon aria-hidden />
          </Button>
        </Tooltip>
        <Tooltip content="Call">
          <Button aria-label="Call">
            <CallIcon aria-hidden />
          </Button>
        </Tooltip>
      </SegmentedButtonGroup>
      <SegmentedButtonGroup>
        <Tooltip content="Message">
          <Button appearance="transparent" aria-label="Message">
            <MessageIcon aria-hidden />
          </Button>
        </Tooltip>
        <Tooltip content="Chat">
          <Button appearance="transparent" aria-label="Chat">
            <ChatGroupIcon aria-hidden />
          </Button>
        </Tooltip>
        <Tooltip content="Call">
          <Button appearance="transparent" aria-label="Call">
            <CallIcon aria-hidden />
          </Button>
        </Tooltip>
      </SegmentedButtonGroup>
    </StackLayout>
  );
};
