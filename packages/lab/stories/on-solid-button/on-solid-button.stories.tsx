import { NotificationIcon } from "@salt-ds/icons";
import { OnSolidButton } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/On Solid Button",
  component: OnSolidButton,
} as Meta<typeof OnSolidButton>;

export const Default: StoryFn<typeof OnSolidButton> = (args) => {
  return (
    <div
      style={{
        background: "var(--salt-status-info-bold-background)",
        padding: "var(--salt-spacing-400)",
        borderRadius: "var(--salt-palette-corner-weak)",
        minWidth: 320,
        minHeight: 160,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <OnSolidButton {...args}>
        <NotificationIcon aria-hidden />
        OnSolidButton
      </OnSolidButton>
    </div>
  );
};
