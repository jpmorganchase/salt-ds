import { Tooltip, TooltipProps, ValidationStatus } from "packages/core/src";
import { QAContainer, QAContainerProps } from "docs/components";
import { ComponentMeta, Story } from "@storybook/react";
import { InfoSolidIcon } from "@salt-ds/icons";

export default {
  title: "Lab/Tooltip/QA",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

const IconWithTooltip = (props: {
  status?: ValidationStatus;
  content?: TooltipProps["content"];
}) => {
  const { content = "hello", status, ...rest } = props;

  return (
    <Tooltip content={content} status={status} {...rest} open>
      <InfoSolidIcon />
    </Tooltip>
  );
};

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  return (
    <QAContainer height={500} itemPadding={45} width={1200} {...props}>
      <IconWithTooltip content="Hello, World" />
      <IconWithTooltip status="error" content="Uh oh, world" />
      <IconWithTooltip
        content={<div style={{ background: "#ccc", width: 60, height: 20 }} />}
      />
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
