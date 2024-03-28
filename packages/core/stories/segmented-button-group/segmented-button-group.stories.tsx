import {
  StackLayout,
  Button,
  Tooltip,
  SegmentedButtonGroup,
  SegmentedButtonGroupProps,
} from "@salt-ds/core";
import { MessageIcon, ChatGroupIcon, CallIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Core/Segmented Button Group",
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
            <Tooltip content="Message">
              <Button variant={variant} aria-label="Message">
                <MessageIcon aria-hidden />
              </Button>
            </Tooltip>
            <Tooltip content="Chat">
              <Button variant={variant} aria-label="Chat">
                <ChatGroupIcon aria-hidden />
              </Button>
            </Tooltip>
            <Tooltip content="Call">
              <Button variant={variant} aria-label="Call">
                <CallIcon aria-hidden />
              </Button>
            </Tooltip>
          </SegmentedButtonGroup>
        );
      })}
    </StackLayout>
  );
};
