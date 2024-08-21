import { Badge, GridLayout } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  type QAContainerNoStyleInjectionProps,
  type QAContainerProps,
} from "docs/components";
import { allIcons } from "./icon.all";

export default {
  title: "Core/Badge/Dot Badge QA",
  component: Badge,
} as Meta<typeof Badge>;

const AllIcons: StoryFn = () => {
  return (
    <GridLayout columns="repeat(25, auto)" gap={1}>
      {allIcons.map((IconComponent) => (
        <Badge key={IconComponent.displayName}>
          <IconComponent />
        </Badge>
      ))}
    </GridLayout>
  );
};

export const AllExamples: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={1700} width={1700} {...props}>
    <AllIcons />
  </QAContainer>
);

AllExamples.parameters = {
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

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props,
) => (
  <QAContainerNoStyleInjection height={1700} width={1700} {...props}>
    <AllIcons />
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
