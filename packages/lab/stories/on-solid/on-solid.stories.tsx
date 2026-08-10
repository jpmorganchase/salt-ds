import { SaltShakerIcon } from "@salt-ds/icons";
import { OnSolid } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/Button",
  component: OnSolid,
} as Meta<typeof OnSolid>;

export const OnSolidStory: StoryFn<typeof OnSolid> = (args) => {
  return (
    <div
      style={{
        background: "var(--salt-actionable-accented-bold-background)",
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
      <OnSolid {...args}>
        <SaltShakerIcon aria-hidden />
        OnSolid
      </OnSolid>
    </div>
  );
};
OnSolidStory.storyName = "OnSolid";
