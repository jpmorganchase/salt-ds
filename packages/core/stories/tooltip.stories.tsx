import { Button, Tooltip, TooltipProps } from "@salt-ds/core";
import { ComponentMeta, Story } from "@storybook/react";
import { useCallback } from "react";

export default {
  title: "Core/Tooltip",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

export const Default: Story<TooltipProps> = (props: TooltipProps) => (
  <Tooltip {...props} content="I am a tooltip">
    <Button>Hover</Button>
  </Tooltip>
);

export const OpenTooltip: Story<TooltipProps> = (props: TooltipProps) => {
  const userProps: TooltipProps = {
    status: "info",
    open: true,
    ...props,
    content: props.content || "I am a tooltip",
  };

  return (
    <Tooltip {...userProps}>
      <Button>Hover</Button>
    </Tooltip>
  );
};

export const ScrollTooltip: Story<TooltipProps> = (props) => {
  const handleScrollButton = useCallback((node: HTMLButtonElement | null) => {
    node?.scrollIntoView({ block: "center", inline: "center" });
  }, []);

  return (
    <div
      style={{
        maxHeight: "100%",
        height: "300vh",
        maxWidth: "100%",
        width: "300vw",
      }}
    >
      <Tooltip {...props}>
        <Button
          style={{ marginTop: "100vh", marginLeft: "100vw" }}
          ref={handleScrollButton}
        >
          Hover
        </Button>
      </Tooltip>
    </div>
  );
};
ScrollTooltip.args = {
  content: "I am a tooltip",
  open: true,
  placement: "top",
};

export const ErrorTooltip: Story<TooltipProps> = (props) => {
  const { status = "error" } = props;

  return (
    <Tooltip content="We found an issue" status={status}>
      <Button>Hover</Button>
    </Tooltip>
  );
};

export const WarningTooltip: Story<TooltipProps> = (props) => {
  const { status = "warning" } = props;

  return (
    <Tooltip content="Are you sure?" status={status}>
      <Button>Hover</Button>
    </Tooltip>
  );
};

export const SuccessTooltip: Story<TooltipProps> = (props) => {
  const { status = "success" } = props;

  return (
    <Tooltip content="Well done" status={status}>
      <Button> Hover</Button>
    </Tooltip>
  );
};

export const ComponentAsContent: Story<TooltipProps> = (props) => {
  const Component = (
    <div>
      <h3>Title</h3>
      <p>Some description</p>
    </div>
  );

  return (
    <Tooltip open content={Component}>
      <Button>Hover</Button>
    </Tooltip>
  );
};
