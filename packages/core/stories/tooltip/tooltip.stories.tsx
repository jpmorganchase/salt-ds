import { Button, Text, Tooltip, TooltipProps } from "@salt-ds/core";
import { ComponentMeta, ComponentStory, Story } from "@storybook/react";
import { useCallback } from "react";

export default {
  title: "Core/Tooltip",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

const defaultArgs: Omit<TooltipProps, "children"> = {
  content: "I am a tooltip",
};

export const Default: Story<TooltipProps> = (props: TooltipProps) => (
  <Tooltip {...props}>
    <Button>Hover</Button>
  </Tooltip>
);
Default.args = defaultArgs;

export const Open: Story<TooltipProps> = Default.bind({});
Open.args = { ...defaultArgs, open: true };

export const Status: ComponentStory<typeof Tooltip> = (props: TooltipProps) => (
  <div style={{ display: "flex", flexDirection: 'column', gap: 8 }}>
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
  </div>
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

export const FlipAndShiftTooltip: Story<TooltipProps> = (props) => {
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
FlipAndShiftTooltip.args = {
  content: "I am a tooltip",
  placement: "top",
  open: true,
};

export const CustomContent: Story<TooltipProps> = (props) => (
  <Tooltip
    {...props}
    content={
      <>
        <Text as="h3">Tooltip</Text>
        <Text>Props:</Text>
        <ul>
          <li>
            <strong>hideIcon:</strong> true
          </li>
          <li>
            <strong>open:</strong> false
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
  <div style={{ display: "flex", gap: 8 }}>
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
  </div>
);
Placement.args = defaultArgs;

export const Delay: Story<TooltipProps> = (props) => (
  <div style={{ display: "flex", flexDirection: 'column', gap: 8 }}>
    <Tooltip {...props} content="I am a tooltip" enterDelay={100}>
      <Button>100ms</Button>
    </Tooltip>
    <Tooltip {...props} content="I am a tooltip">
      <Button>300ms</Button>
    </Tooltip>
    <Tooltip {...props} content="I am a tooltip" enterDelay={500}>
      <Button>500ms</Button>
    </Tooltip>
  </div>
);
Delay.args = defaultArgs;
