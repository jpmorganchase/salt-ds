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
  title: "Core/Tooltip",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

export const Default: Story<TooltipProps & UseTooltipProps> = (props) => {
  const { getTriggerProps, getTooltipProps } = useTooltip(props);

  const defaultProps = getTooltipProps({
    title: "I am a tooltip",
    status: "info",
  });

  return (
    <>
      <Button {...getTriggerProps<typeof Button>()}>Hover</Button>
      <Tooltip {...defaultProps} />
    </>
  );
};

export const OpenTooltip: Story<TooltipProps & UseTooltipProps> = (props) => {
  const { getTriggerProps, getTooltipProps } = useTooltip(props);

  const openProps = getTooltipProps({
    title: "I am a tooltip",
    status: "info",
    open: true,
  });

  return (
    <>
      <Button {...getTriggerProps<typeof Button>()}>Hover</Button>
      <Tooltip {...openProps} />
    </>
  );
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

export const ErrorTooltip: Story<TooltipProps & UseTooltipProps> = (props) => {
  const { status = "error", ...rest } = props;
  const { getTriggerProps, getTooltipProps } = useTooltip(rest);

  return (
    <>
      <Button {...getTriggerProps<typeof Button>()}>Hover</Button>
      <Tooltip {...getTooltipProps({ title: "We found an issue", status })} />
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
      <Button {...getTriggerProps<typeof Button>()}>Hover</Button>
      <Tooltip {...getTooltipProps({ title: "Are you sure?", status })} />
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
      <Button {...getTriggerProps<typeof Button>()}>Hover</Button>
      <Tooltip {...getTooltipProps({ title: "Well done", status })} />
    </>
  );
};
