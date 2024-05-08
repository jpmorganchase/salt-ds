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
    <QAContainer height={670} itemPadding={25} width={1200} {...props}>
      <IconWithTooltip content="Default" />
      <IconWithTooltip status="info" content="Info" />
      <IconWithTooltip status="error" content="Error" />
      <IconWithTooltip status="success" content="Success" />
      <IconWithTooltip status="warning" content="Warning" />
      <IconWithTooltip content={0} />
      <div
        style={{
          width: 10,
          height: 10,
          overflow: "hidden",
          position: "absolute",
        }}
      >
        <IconWithTooltip content="Hidden trigger" />
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
    height={670}
    itemPadding={25}
    width={1200}
    {...props}
  >
    <IconWithTooltip content="Default" />
    <IconWithTooltip status="info" content="Info" />
    <IconWithTooltip status="error" content="Error" />
    <IconWithTooltip status="success" content="Success" />
    <IconWithTooltip status="warning" content="Warning" />
    <div
      style={{
        width: 10,
        height: 10,
        overflow: "hidden",
        position: "absolute",
      }}
    >
      <IconWithTooltip content="Hidden trigger" />
    </div>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
