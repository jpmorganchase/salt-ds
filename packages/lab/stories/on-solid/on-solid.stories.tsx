import { OnSolid } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/Button",
  component: OnSolid,
} as Meta<typeof OnSolid>;

export const OnSolidStory: StoryFn<typeof OnSolid> = (args) => {
  return <OnSolid {...args}>OnSolid</OnSolid>;
};
OnSolidStory.storyName = "OnSolid";

