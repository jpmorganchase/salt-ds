import {
  Button,
  StackLayout,
  Text,
  Tooltip,
  type TooltipProps,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useCallback } from "react";

export default {
  title: "Core/Tooltip",
  component: Tooltip,
} as Meta<typeof Tooltip>;

const defaultArgs: Omit<TooltipProps, "children"> = {
  content: "I am a tooltip",
};

export const Default: StoryFn<TooltipProps> = (props: TooltipProps) => (
  <Tooltip {...props}>
    <Button>Hover</Button>
  </Tooltip>
);
Default.args = defaultArgs;

export const Open: StoryFn<TooltipProps> = Default.bind({});
Open.args = { ...defaultArgs, open: true };

export const Status: StoryFn<typeof Tooltip> = (props: TooltipProps) => (
  <StackLayout gap={1} align="start">
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
  </StackLayout>
);
Status.args = defaultArgs;

export const WithoutArrow: StoryFn<TooltipProps> = (props) => (
  <Tooltip {...props} hideArrow>
    <Button>Without Arrow</Button>
  </Tooltip>
);
WithoutArrow.args = defaultArgs;

export const WithoutIcon: StoryFn<TooltipProps> = (props) => (
  <Tooltip {...props} hideIcon>
    <Button>Without Icon</Button>
  </Tooltip>
);
WithoutIcon.args = defaultArgs;

export const FlipAndShiftTooltip: StoryFn<TooltipProps> = (props) => {
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

export const CustomContent: StoryFn<TooltipProps> = (props) => (
  <Tooltip
    {...props}
    content={
      <>
        <StackLayout gap={0.5} align="start">
          <Text styleAs="h3">Persona B</Text>
          <Text styleAs="h4">personab@example.com</Text>
        </StackLayout>
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

export const Placement: StoryFn<TooltipProps> = (props) => (
  <StackLayout gap={4} align="start">
    <StackLayout gap={1} align="start">
      <Tooltip {...props} content="I am a tooltip" placement={"top"}>
        <Button>Top</Button>
      </Tooltip>
      <Tooltip {...props} content="I am a tooltip" placement={"bottom"}>
        <Button>Bottom</Button>
      </Tooltip>
    </StackLayout>
    <StackLayout gap={1} align="start">
      <Tooltip {...props} content="I am a tooltip" placement={"left"}>
        <Button>Left</Button>
      </Tooltip>
      <Tooltip {...props} content="I am a tooltip" placement={"right"}>
        <Button>Right</Button>
      </Tooltip>
    </StackLayout>
  </StackLayout>
);
Placement.args = defaultArgs;

export const Delay: StoryFn<TooltipProps> = (props) => (
  <StackLayout gap={1} align="start">
    <Tooltip {...props} content="I am a tooltip" enterDelay={100}>
      <Button>100ms</Button>
    </Tooltip>
    <Tooltip {...props} content="I am a tooltip">
      <Button>300ms</Button>
    </Tooltip>
    <Tooltip {...props} content="I am a tooltip" enterDelay={500}>
      <Button>500ms</Button>
    </Tooltip>
  </StackLayout>
);
Delay.args = defaultArgs;
