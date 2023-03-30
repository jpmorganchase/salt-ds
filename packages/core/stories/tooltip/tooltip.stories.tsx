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
  <>
    <div style={{ marginBottom: 10 }}>
      <Tooltip {...props} content="I am a tooltip" status="info">
        <Button>Info</Button>
      </Tooltip>
    </div>
    <div style={{ marginBottom: 10 }}>
      <Tooltip {...props} content="We found an issue" status="error">
        <Button>Error</Button>
      </Tooltip>
    </div>
    <div style={{ marginBottom: 10 }}>
      <Tooltip {...props} content="Are you sure" status="warning">
        <Button>Warning</Button>
      </Tooltip>
    </div>
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
        <Text as="h3">Persona B</Text>
        <Text as="h4">personab@example.com</Text>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>Role</li>
          <li>Position</li>
          <li>Location</li>
          <li>City, Country</li>
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
    <div style={{ marginBottom: 10 }}>
      <Tooltip {...props} content="I am a tooltip" placement={"top"}>
        <Button>Top</Button>
      </Tooltip>
    </div>
    <div style={{ marginBottom: 40 }}>
      <Tooltip {...props} content="I am a tooltip" placement={"bottom"}>
        <Button>Bottom</Button>
      </Tooltip>
    </div>
    <div style={{ marginBottom: 10 }}>
      <Tooltip {...props} content="I am a tooltip" placement={"left"}>
        <Button>Left</Button>
      </Tooltip>
    </div>
    <Tooltip {...props} content="I am a tooltip" placement={"right"}>
      <Button>Right</Button>
    </Tooltip>
  </>
);
Placement.args = defaultArgs;

export const Delay: Story<TooltipProps> = (props) => (
  <>
    <div style={{ marginBottom: 10 }}>
      <Tooltip {...props} content="I am a tooltip" enterDelay={100}>
        <Button>100ms</Button>
      </Tooltip>
    </div>
    <div style={{ marginBottom: 10 }}>
      <Tooltip {...props} content="I am a tooltip">
        <Button>300ms</Button>
      </Tooltip>
    </div>
    <Tooltip {...props} content="I am a tooltip" enterDelay={500}>
      <Button>500ms</Button>
    </Tooltip>
  </>
);
Delay.args = defaultArgs;
