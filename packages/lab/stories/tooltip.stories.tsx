import { Button, Text } from "@salt-ds/core";
import { Tooltip, TooltipProps } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory, Story } from "@storybook/react";
import { useCallback } from "react";

export default {
  title: "Lab/Tooltip",
  component: Tooltip,
  argTypes: {
    content: { control: { type: "text" } },
    placement: {
      control: {
        type: "select",
        options: [
          "top",
          "bottom",
          "left",
          "right",
          "top-start",
          "top-end",
          "right-start",
          "right-end",
          "bottom-start",
          "bottom-end",
          "left-start",
          "left-end",
        ],
      },
    },
    open: { control: { type: "boolean" } },
    hideArrow: { control: { type: "boolean" } },
    hideIcon: { control: { type: "boolean" } },
    status: {
      control: {
        type: "select",
        options: ["info", "warning", "error", "success"],
      },
    },
    enterDelay: { control: { type: "number" } },
    leaveDelay: { control: { type: "number" } },
    disabled: { control: { type: "boolean" } },
    disableHoverListener: { control: { type: "boolean" } },
    disableFocusListener: { control: { type: "boolean" } },
  },
} as ComponentMeta<typeof Tooltip>;

const defaultArgs: Omit<TooltipProps, "children"> = {
  content: "I am a tooltip",
  placement: undefined,
  open: undefined,
  hideArrow: undefined,
  hideIcon: undefined,
  status: undefined,
  enterDelay: undefined,
  leaveDelay: undefined,
  disabled: undefined,
  disableHoverListener: undefined,
  disableFocusListener: undefined,
};

export const Default: Story<TooltipProps> = (props: TooltipProps) => (
  <Tooltip {...props}>
    <Button>Hover</Button>
  </Tooltip>
);
Default.args = defaultArgs;

export const Status: ComponentStory<typeof Tooltip> = (props: TooltipProps) => (
  <>
    <Tooltip {...props} content="I am a tooltip" status="info">
      <Button>Info</Button>
    </Tooltip>
    <Tooltip {...props} content="We found an issue" status="error">
      <Button>Error</Button>
    </Tooltip>
    <Tooltip {...props} content="Are you sure" status="warning">
      <Button>Warning</Button>
    </Tooltip>
    <Tooltip {...props} content="Well done" status="success">
      <Button>Success</Button>
    </Tooltip>
  </>
);
Status.args = defaultArgs;

export const WithoutArrow: Story<TooltipProps> = (props) => (
  <Tooltip {...props} hideArrow>
    <Button>Without Arrow</Button>
  </Tooltip>
);
WithoutArrow.args = defaultArgs;

export const WithoutIcon: Story<TooltipProps> = (props) => (
  <Tooltip {...props} hideIcon>
    <Button>Without Icon</Button>
  </Tooltip>
);
WithoutIcon.args = defaultArgs;

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
  placement: "top",
  open: true,
};

export const CustomContent: Story<TooltipProps> = (props) => (
  <Tooltip
    {...props}
    content={
      <>
        <Text styleAs="h3">Tooltip</Text>
        <Text>Props:</Text>
        <ul>
          <li>
            <strong>hideIcon:</strong> true
          </li>
          <li>
            <strong>open:</strong> true
          </li>
          <li>
            <strong>status:</strong> info
          </li>
        </ul>
      </>
    }
  >
    <Button>Custom Content</Button>
  </Tooltip>
);
CustomContent.args = { ...defaultArgs, hideIcon: true };

export const Placement: Story<TooltipProps> = (props) => (
  <>
    <Tooltip {...props} content="I am a tooltip" placement={"top"}>
      <Button>Top</Button>
    </Tooltip>
    <Tooltip {...props} content="I am a tooltip" placement={"bottom"}>
      <Button>Bottom</Button>
    </Tooltip>
    <Tooltip {...props} content="I am a tooltip" placement={"left"}>
      <Button>Left</Button>
    </Tooltip>
    <Tooltip {...props} content="I am a tooltip" placement={"right"}>
      <Button>Right</Button>
    </Tooltip>
  </>
);
Placement.args = defaultArgs;

export const Delay: Story<TooltipProps> = (props) => (
  <>
    <Tooltip {...props} content="I am a tooltip" enterDelay={100}>
      <Button>100ms</Button>
    </Tooltip>
    <Tooltip {...props} content="I am a tooltip">
      <Button>300ms</Button>
    </Tooltip>
    <Tooltip {...props} content="I am a tooltip" enterDelay={500}>
      <Button>500ms</Button>
    </Tooltip>
  </>
);
Delay.args = defaultArgs;
