import { StackLayout, Button, Tooltip } from "@salt-ds/core";
import { SegmentedButtonGroup, SegmentedButtonGroupProps } from "@salt-ds/lab";
import {
  MessageIcon,
  ChatGroupIcon,
  CallIcon,
  FavoriteIcon,
} from "@salt-ds/icons";
import { StoryFn, Meta } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Segmented Button Group/Segmented Button Group QA",
  component: SegmentedButtonGroup,
} as Meta<typeof SegmentedButtonGroup>;

type variants = "primary" | "secondary" | "cta" | undefined;

const variants: variants[] = ["primary", "secondary", "cta"];

export const Default: StoryFn<SegmentedButtonGroupProps> = () => {
  return (
    <StackLayout>
      <StackLayout>
        {variants.map((variant) => {
          return (
            <SegmentedButtonGroup key={variant}>
              <Button variant={variant}> Button </Button>
              <Button variant={variant}> Button </Button>
              <Button variant={variant}> Button </Button>
            </SegmentedButtonGroup>
          );
        })}
      </StackLayout>
    </StackLayout>
  );
};

Default.parameters = {
  chromatic: { disableSnapshot: false },
};

export const Icons: StoryFn<SegmentedButtonGroupProps> = () => {
  return (
    <StackLayout>
      {variants.map((variant) => {
        return (
          <SegmentedButtonGroup key={variant}>
            <Button variant={variant}>
              <Tooltip content="Message">
                <MessageIcon />
              </Tooltip>
            </Button>
            <Button variant={variant}>
              <Tooltip content="Chat">
                <ChatGroupIcon />
              </Tooltip>
            </Button>
            <Button variant={variant}>
              <Tooltip content="Call">
                <CallIcon />
              </Tooltip>
            </Button>
          </SegmentedButtonGroup>
        );
      })}
    </StackLayout>
  );
};

Icons.parameters = {
  chromatic: { disableSnapshot: false },
};
