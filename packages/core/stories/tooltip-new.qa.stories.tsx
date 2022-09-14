import {
  TooltipNew,
  TooltipNewProps,
  // TooltipState,
  useTooltip,
  ValidationStatus,
} from "@jpmorganchase/uitk-core";
import { QAContainer, QAContainerProps } from "docs/components";
import { ComponentMeta, Story } from "@storybook/react";
import { InfoIcon } from "@jpmorganchase/uitk-icons";
import { Placement } from "@floating-ui/react-dom-interactions";

export default {
  title: "Core/TooltipNew/QA",
  component: TooltipNew,
} as ComponentMeta<typeof TooltipNew>;

const IconWithTooltip = (props: {
  status?: ValidationStatus;
  title?: string;
  placement?: Placement;
  className?: string;
  render?: TooltipNewProps["render"];
}) => {
  const { title = "hello", status, className, placement, ...rest } = props;

  return (
    <TooltipNew
      className={className}
      title={title}
      status={status}
      placement={placement}
      {...rest}
      open
    >
      <InfoIcon />
    </TooltipNew>
  );
};

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  const { className } = props;
  return (
    <QAContainer itemPadding={50} cols={3} height={1000} {...props}>
      <IconWithTooltip
        className={className}
        placement="top"
        title="Hello, world"
      />
      <IconWithTooltip
        className={className}
        placement="bottom"
        title="Hello, world"
      />
      <IconWithTooltip
        className={className}
        placement="left"
        title="Hello, world"
      />
      <IconWithTooltip
        className={className}
        placement="right"
        title="Hello, world"
      />
      <IconWithTooltip
        className={className}
        status="error"
        title="Uh oh, world"
      />
      <IconWithTooltip
        className={className}
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
