import { ValidationStatus } from "@salt-ds/core"
import { Tooltip, TooltipProps, useTooltip } from "@salt-ds/lab";
import { QAContainer, QAContainerProps } from "docs/components";
import { ComponentMeta, Story } from "@storybook/react";
import { InfoSolidIcon } from "@salt-ds/icons";

export default {
  title: "Lab/Tooltip/QA",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

const IconWithTooltip = (props: {
  status?: ValidationStatus;
  text?: string;
  render?: TooltipProps["render"];
}) => {
  const { text = "hello", status, render, ...rest } = props;
  const { getTriggerProps, getTooltipProps } = useTooltip(rest);

  return (
    <Tooltip {...getTooltipProps({ render, text, status })} open >
      <InfoSolidIcon {...getTriggerProps<typeof InfoSolidIcon>()} />
    </Tooltip>
  );
};

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  return (
    <QAContainer height={500} itemPadding={45} width={1200} {...props}>
      <IconWithTooltip text="Hello, World" />
      <IconWithTooltip status="error" text="Uh oh, world" />
      <IconWithTooltip
        render={() => (
          <div style={{ background: "#ccc", width: 60, height: 20 }} />
        )}
      />
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
