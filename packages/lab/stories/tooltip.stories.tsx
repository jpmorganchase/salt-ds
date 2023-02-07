import { Button } from "@salt-ds/core";
import { Tooltip, TooltipProps } from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import { useCallback } from "react";

export default {
  title: "Lab/Tooltip",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

export const Default: Story<TooltipProps> = (props: TooltipProps) => (
  <Tooltip {...props}>
    <Button>Hover</Button>
  </Tooltip>
);
Default.args = {
  content: "I am a tooltip",
};

export const OpenTooltip: Story<TooltipProps> = (props: TooltipProps) => (
  <Tooltip open {...props}>
    <Button>Hover</Button>
  </Tooltip>
);
OpenTooltip.args = {
  content: "I am a tooltip",
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
      <Tooltip open {...props}>
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
  placement: "top",
};

export const ErrorTooltip: Story<TooltipProps> = (props) => (
  <Tooltip {...props}>
    <Button>Hover</Button>
  </Tooltip>
);
ErrorTooltip.args = {
  content: "We found an issue",
  status: "error",
};

export const WarningTooltip: Story<TooltipProps> = (props) => (
  <Tooltip {...props}>
    <Button>Hover</Button>
  </Tooltip>
);
WarningTooltip.args = {
  content: "Are you sure?",
  status: "warning",
};

export const SuccessTooltip: Story<TooltipProps> = (props) => (
  <Tooltip {...props}>
    <Button>Hover</Button>
  </Tooltip>
);
SuccessTooltip.args = {
  content: "Well done",
  status: "success",
};

export const ComponentAsContent: Story<TooltipProps> = (props) => {
  const Component = (
    <div>
      <h3>Title</h3>
      <p>Some description</p>
    </div>
  );

  return (
    <Tooltip open {...props} content={Component}>
      <Button>Hover</Button>
    </Tooltip>
  );
};
