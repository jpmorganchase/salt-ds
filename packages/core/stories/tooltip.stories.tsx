import {
  Button,
  Tooltip,
  TooltipProps,
  useForkRef,
  useTooltip,
  UseTooltipProps,
} from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory, Story } from "@storybook/react";
import { useCallback } from "react";

export default {
  title: "Core/Tooltip",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

const Template: Story<TooltipProps & UseTooltipProps> = (props) => {
  const { title, state, ...rest } = props;
  const { getTriggerProps, getTooltipProps } = useTooltip(rest);

  return (
    <>
      <Button {...getTriggerProps<typeof Button>()}>Hover</Button>
      <Tooltip {...getTooltipProps({ title, state })} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: "I am a tooltip",
};

export const OpenTooltip = Template.bind({});
OpenTooltip.args = {
  title: "I am a tooltip",
  open: true,
};

export const ScrollTooltip: Story<TooltipProps & UseTooltipProps> = (props) => {
  const handleScrollButton = useCallback((node: HTMLButtonElement | null) => {
    node?.scrollIntoView({ block: "center", inline: "center" });
  }, []);

  const { title, ...rest } = props;
  const { getTriggerProps, getTooltipProps } = useTooltip(rest);

  const { ref, ...triggerProps } = getTriggerProps<typeof Button>({
    style: { marginTop: "100vh", marginLeft: "100vw" },
  });

  const handleButtonRef = useForkRef(handleScrollButton, ref);

  return (
    <div
      style={{
        maxHeight: "100%",
        height: "300vh",
        maxWidth: "100%",
        width: "300vw",
      }}
    >
      <Button ref={handleButtonRef} {...triggerProps}>
        Hover
      </Button>
      <Tooltip {...getTooltipProps({ title })} />
    </div>
  );
};
ScrollTooltip.args = {
  title: "I am a tooltip",
  open: true,
  placement: "top",
};

export const ErrorTooltip: ComponentStory<typeof Tooltip> = Template.bind({});
ErrorTooltip.args = {
  title: "We found an issue",
  state: "error",
};

export const WarningTooltip: ComponentStory<typeof Tooltip> = Template.bind({});
WarningTooltip.args = {
  title: "Are you sure?",
  state: "warning",
};

export const SuccessTooltip: ComponentStory<typeof Tooltip> = Template.bind({});
SuccessTooltip.args = {
  title: "Well done",
  state: "success",
};
