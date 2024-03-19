import { SegmentedButtonGroup, SegmentedButtonGroupProps } from "@salt-ds/lab";
import { StackLayout, Button, Tooltip } from "@salt-ds/core";
import { MessageIcon, ChatGroupIcon, CallIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Segmented Button Group",
  component: SegmentedButtonGroup,
} as Meta<typeof SegmentedButtonGroup>;

type variants = "primary" | "secondary" | "cta" | undefined;

const variants: variants[] = ["primary", "secondary", "cta"];

export const Default: StoryFn<SegmentedButtonGroupProps> = () => {
  return (
    <StackLayout>
      {variants.map((variant) => {
        return (
          <SegmentedButtonGroup key={variant}>
            <Button variant={variant}>Button</Button>
            <Button variant={variant}>Button</Button>
            <Button variant={variant}>Button</Button>
          </SegmentedButtonGroup>
        );
      })}
    </StackLayout>
  );
};

export const Icons: StoryFn<SegmentedButtonGroupProps> = () => {
  return (
    <StackLayout>
      {variants.map((variant) => {
        return (
          <SegmentedButtonGroup key={variant}>
            <Button variant={variant} aria-label="Message">
              <Tooltip content="Message">
                <MessageIcon aria-hidden />
              </Tooltip>
            </Button>
            <Button variant={variant} aria-label="Chat">
              <Tooltip content="Chat">
                <ChatGroupIcon aria-hidden />
              </Tooltip>
            </Button>
            <Button variant={variant} aria-label="Call">
              <Tooltip content="Call">
                <CallIcon aria-hidden />
              </Tooltip>
            </Button>
          </SegmentedButtonGroup>
        );
      })}
    </StackLayout>
  );
};
