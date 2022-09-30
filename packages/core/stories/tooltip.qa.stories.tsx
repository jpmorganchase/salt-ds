import {
  Tooltip,
  TooltipProps,
  // TooltipStatus,
  // useTooltip,
  ValidationStatus,
} from "@jpmorganchase/uitk-core";
import { QAContainer, QAContainerProps } from "docs/components";
import { ComponentMeta, Story } from "@storybook/react";
import { InfoIcon } from "@jpmorganchase/uitk-icons";
import { Placement } from "@floating-ui/react-dom-interactions";

export default {
  title: "Core/Tooltip/QA",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

const IconWithTooltip = (props: {
  status?: ValidationStatus;
  text?: string;
  placement?: Placement;
  className?: string;
  render?: TooltipProps["render"];
}) => {
  // const { title = "hello", ...rest } = props;
  // const { getTriggerProps, getTooltipProps } = useTooltip(rest);
  console.log("--- props", props);

  return (
    <Tooltip open text="I am a tooltip" status="info">
      <InfoIcon />
      {/* <InfoIcon {...getTriggerProps<typeof InfoIcon>()} /> */}
      {/* <Tooltip {...getTooltipProps({ render, title, status })} open /> */}
    </Tooltip>
  );
};

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  const { className } = props;
  return (
    <QAContainer itemPadding={50} cols={3} height={1000} {...props}>
      <IconWithTooltip
        className={className}
        placement="top"
        text="Hello, world"
      />
      <IconWithTooltip
        className={className}
        placement="bottom"
        text="Hello, world"
      />
      <IconWithTooltip
        className={className}
        placement="left"
        text="Hello, world"
      />
      <IconWithTooltip
        className={className}
        placement="right"
        text="Hello, world"
      />
      <IconWithTooltip
        className={className}
        status="error"
        text="Uh oh, world"
      />
      <IconWithTooltip
        className={className}
        text="Hello, world"
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

export const BackwardsCompat: Story = () => {
  return <AllExamplesGrid className="backwardsCompat" />;
};

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <AllExamplesGrid
      className="backwardsCompat"
      imgSrc="/visual-regression-screenshots/Tooltip-vr-snapshot.png"
    />
  );
};
