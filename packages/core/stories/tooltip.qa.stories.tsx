import {
  Tooltip,
  TooltipProps,
  TooltipStatus,
  useTooltip,
} from "@jpmorganchase/uitk-core";
import { QAContainer, QAContainerProps } from "docs/components";
import { ComponentMeta, Story } from "@storybook/react";
import { InfoSolidIcon } from "@jpmorganchase/uitk-icons";

export default {
  title: "Core/Tooltip/QA",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

const IconWithTooltip = (props: {
  status?: TooltipStatus;
  title?: string;
  render?: TooltipProps["render"];
}) => {
  const { title = "hello", status, render, ...rest } = props;
  const { getTriggerProps, getTooltipProps } = useTooltip(rest);

  return (
    <>
      <InfoSolidIcon {...getTriggerProps<typeof InfoSolidIcon>()} />
      <Tooltip {...getTooltipProps({ render, title, status })} open />
    </>
  );
};

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  return (
    <QAContainer height={500} itemPadding={45} width={1200} {...props}>
      <IconWithTooltip title="Hello, World" />
      <IconWithTooltip status="error" title="Uh oh, world" />
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
