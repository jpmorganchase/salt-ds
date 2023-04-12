import { Button, Portal, Tooltip } from "@salt-ds/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Core/Portal",
  component: Portal,
} as ComponentMeta<typeof Portal>;

export const TooltipExample: ComponentStory<typeof Portal> = (args) => {
  const TooltipContent = () => {
    return (
      <div>
        <div>Tooltp</div>
        <Tooltip content="Another tooltip content">
          <Button>Another Button</Button>
        </Tooltip>
      </div>
    );
  };
  return (
    <Portal {...args} container={document.querySelector("#root")}>
      <Tooltip content={<TooltipContent />}>
        <Button>Button</Button>
      </Tooltip>
    </Portal>
  );
};
