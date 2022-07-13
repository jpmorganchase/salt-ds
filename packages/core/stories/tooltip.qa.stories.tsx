import {
  Tooltip,
  TooltipProps,
  TooltipState,
  useTooltip,
} from "@jpmorganchase/uitk-core";
import { QAContainer, QAContainerProps } from "docs/components";
import { ComponentMeta, Story } from "@storybook/react";
import { InfoIcon } from "@jpmorganchase/uitk-icons";

export default {
  title: "Core/Tooltip/QA",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

const IconWithTooltip = (props: {
  state?: TooltipState;
  title?: string;
  render?: TooltipProps["render"];
}) => {
  const { title = "hello", state, render, ...rest } = props;
  const { getTriggerProps, getTooltipProps } = useTooltip(rest);

  return (
    <>
      <InfoIcon {...getTriggerProps<typeof InfoIcon>()} />
      <Tooltip {...getTooltipProps({ render, title, state })} open />
    </>
  );
};

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  return (
    <QAContainer height={500} itemPadding={45} width={1200} {...props}>
      <IconWithTooltip title="Hello, World" />
      <IconWithTooltip state="error" title="Uh oh, world" />
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

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <AllExamplesGrid
      className="backwardsCompat"
      imgSrc="/visual-regression-screenshots/Tooltip-vr-snapshot.png"
    />
  );
};
