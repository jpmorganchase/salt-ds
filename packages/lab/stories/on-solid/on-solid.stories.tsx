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
        // Solid accent (blue/teal) fill that adapts to light/dark mode,
        // representing the solid semantic surface OnSolid is designed to sit on.
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
      <OnSolid {...args}>BUTTON</OnSolid>
    </div>
  );
};
OnSolidStory.storyName = "OnSolid";
