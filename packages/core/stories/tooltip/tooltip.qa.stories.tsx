import { Tooltip, TooltipProps } from "@salt-ds/core";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  QAContainerNoStyleInjectionProps,
  QAContainerProps,
} from "docs/components";
import { Meta, StoryFn } from "@storybook/react";
import { InfoSolidIcon } from "@salt-ds/icons";

export default {
  title: "Core/Tooltip/Tooltip QA",
  component: Tooltip,
} as Meta<typeof Tooltip>;

const IconWithTooltip = (props: {
  status?: TooltipProps["status"];
  content?: TooltipProps["content"];
}) => {
  const { content = "hello", status, ...rest } = props;

  return (
    <Tooltip content={content} status={status} {...rest} open>
      <InfoSolidIcon />
    </Tooltip>
  );
};

export const AllExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer height={500} itemPadding={45} width={1200} {...props}>
      <IconWithTooltip content="Hello, World" />
      <IconWithTooltip status="error" content="Uh oh, world" />
      <IconWithTooltip
        content={
          <div
            style={{
              background: "var(--salt-text-secondary-foreground)",
              width: 60,
              height: "var(--salt-text-lineHeight)",
            }}
          />
        }
      />
      <div
        style={{
          width: 10,
          height: 10,
          overflow: "hidden",
          position: "absolute",
        }}
      >
        <IconWithTooltip content="Hidden, World?" />
      </div>
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props
) => (
  <QAContainerNoStyleInjection
    height={500}
    itemPadding={45}
    width={1200}
    {...props}
  >
    <IconWithTooltip content="Hello, World" />
    <IconWithTooltip status="error" content="Uh oh, world" />
    <IconWithTooltip
      content={<div style={{ background: "#ccc", width: 60, height: 20 }} />}
    />
    <div
      style={{
        width: 10,
        height: 10,
        overflow: "hidden",
        position: "absolute",
      }}
    >
      <IconWithTooltip content="Hidden, World?" />
    </div>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
