import { Button, useForkRef } from "@salt-ds/core";
import {
  Tooltip,
  TooltipProps,
  useTooltip,
  UseTooltipProps,
} from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import { useCallback } from "react";

export default {
  title: "Lab/Tooltip",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

export const Default: Story<TooltipProps & UseTooltipProps> = (props) => {
  const { getTriggerProps, getTooltipProps } = useTooltip(props);

  const defaultProps = getTooltipProps({
    text: "I am a tooltip",
    status: "info",
  });

  return (
    <>
      <Tooltip {...defaultProps} >
        <Button {...getTriggerProps<typeof Button>()}>Hover</Button>
      </Tooltip>
    </>
  );
};

export const OpenTooltip: Story<TooltipProps & UseTooltipProps> = (props) => {
  const { getTriggerProps, getTooltipProps } = useTooltip(props);

  const openProps = getTooltipProps({
    text: "I am a tooltip",
    status: "info",
    open: true,
  });

  return (
    <>
      <Tooltip {...openProps} >
        <Button {...getTriggerProps<typeof Button>()}>Hover</Button>
      </Tooltip>
    </>
  );
};

export const ScrollTooltip: Story<TooltipProps & UseTooltipProps> = (props) => {
  const handleScrollButton = useCallback((node: HTMLButtonElement | null) => {
    node?.scrollIntoView({ block: "center", inline: "center" });
  }, []);

  const { text, ...rest } = props;
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
      <Tooltip {...getTooltipProps({ text })} >
        <Button ref={handleButtonRef} {...triggerProps}>
          Hover
        </Button>
      </Tooltip>
    </div>
  );
};
ScrollTooltip.args = {
  text: "I am a tooltip",
  open: true,
  placement: "top",
};

export const ErrorTooltip: Story<TooltipProps & UseTooltipProps> = (props) => {
  const { status = "error", ...rest } = props;
  const { getTriggerProps, getTooltipProps } = useTooltip(rest);

  return (
    <>
      <Tooltip {...getTooltipProps({ text: "We found an issue", status })} >
        <Button {...getTriggerProps<typeof Button>()}>Hover</Button>
      </Tooltip>
    </>
  );
};

export const WarningTooltip: Story<TooltipProps & UseTooltipProps> = (
  props
) => {
  const { status = "warning", ...rest } = props;
  const { getTriggerProps, getTooltipProps } = useTooltip(rest);

  return (
    <>
      <Tooltip {...getTooltipProps({ text: "Are you sure?", status })} >
        <Button {...getTriggerProps<typeof Button>()}>Hover</Button>
      </Tooltip>
    </>
  );
};

export const SuccessTooltip: Story<TooltipProps & UseTooltipProps> = (
  props
) => {
  const { status = "success", ...rest } = props;
  const { getTriggerProps, getTooltipProps } = useTooltip(rest);

  return (
    <>
      <Tooltip {...getTooltipProps({ text: "Well done", status })} >
        <Button {...getTriggerProps<typeof Button>()}>Hover</Button>
      </Tooltip>
    </>
  );
};
