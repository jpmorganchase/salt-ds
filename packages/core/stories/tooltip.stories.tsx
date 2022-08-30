import {
  Button,
  Tooltip,
  TooltipProps,
  useForkRef,
  useTooltip,
  UseTooltipProps,
  ToolkitProvider,
  Panel,
} from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory, Story } from "@storybook/react";
import { useCallback } from "react";

import "./Tooltip.stories.newapp-tooltip.css";

export default {
  title: "Core/Tooltip",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

export const Default: Story<TooltipProps & UseTooltipProps> = (props) => {
  const { getTriggerProps, getTooltipProps } = useTooltip(props);

  const defaultProps = getTooltipProps({
    title: "I am a tooltip",
    state: "info",
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
    state: "info",
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
  const { state = "error", ...rest } = props;
  const { getTriggerProps, getTooltipProps } = useTooltip(rest);

  return (
    <>
      <Button {...getTriggerProps<typeof Button>()}>Hover</Button>
      <Tooltip {...getTooltipProps({ title: "We found an issue", state })} />
    </>
  );
};

export const WarningTooltip: Story<TooltipProps & UseTooltipProps> = (
  props
) => {
  const { state = "warning", ...rest } = props;
  const { getTriggerProps, getTooltipProps } = useTooltip(rest);

  return (
    <>
      <Button {...getTriggerProps<typeof Button>()}>Hover</Button>
      <Tooltip {...getTooltipProps({ title: "Are you sure?", state })} />
    </>
  );
};

export const SuccessTooltip: Story<TooltipProps & UseTooltipProps> = (
  props
) => {
  const { state = "success", ...rest } = props;
  const { getTriggerProps, getTooltipProps } = useTooltip(rest);

  return (
    <>
      <Button {...getTriggerProps<typeof Button>()}>Hover</Button>
      <Tooltip {...getTooltipProps({ title: "Well done", state })} />
    </>
  );
};

export const CustomStyling: ComponentStory<typeof Tooltip> = () => (
  <>
    <ToolkitProvider density="high" theme={["light", "newapp"]}>
      <Panel>
        <Default />
      </Panel>
    </ToolkitProvider>
    <ToolkitProvider density="medium" theme={["light", "newapp"]}>
      <Panel>
        <WarningTooltip />
      </Panel>
    </ToolkitProvider>
    <ToolkitProvider density="low" theme={["dark", "newapp"]}>
      <Panel>
        <Default />
      </Panel>
    </ToolkitProvider>
    <ToolkitProvider density="touch" theme={["dark", "newapp"]}>
      <Panel>
        <WarningTooltip />
      </Panel>
    </ToolkitProvider>
  </>
);
