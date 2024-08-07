import {
  Button,
  SegmentedButtonGroup,
  type SegmentedButtonGroupProps,
  StackLayout,
} from "@salt-ds/core";
import { CallIcon, ChatGroupIcon, MessageIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer } from "docs/components";

export default {
  title: "Core/Segmented Button Group/Segmented Button Group QA",
  component: SegmentedButtonGroup,
} as Meta<typeof SegmentedButtonGroup>;

type variants = "primary" | "secondary" | "cta" | undefined;

const variants: variants[] = ["primary", "secondary", "cta"];

export const Default: StoryFn<SegmentedButtonGroupProps> = () => {
  return (
    <QAContainer>
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
    </QAContainer>
  );
};

Default.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};

export const Icons: StoryFn<SegmentedButtonGroupProps> = () => {
  return (
    <QAContainer>
      <StackLayout>
        {variants.map((variant) => {
          return (
            <SegmentedButtonGroup key={variant}>
              <Button variant={variant}>
                <MessageIcon />
              </Button>
              <Button variant={variant}>
                <ChatGroupIcon />
              </Button>
              <Button variant={variant}>
                <CallIcon />
              </Button>
            </SegmentedButtonGroup>
          );
        })}
      </StackLayout>
    </QAContainer>
  );
};

Icons.parameters = {
  chromatic: { disableSnapshot: false },
};
