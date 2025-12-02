import type { Meta, StoryObj } from "@storybook/react";
import { Tree } from "@salt-ds/lab";

const meta: Meta<typeof Tree> = {
  title: "Lab/Tree",
  component: Tree,
};

export default meta;

type Story = StoryObj<typeof Tree>;

export const Default: Story = {
  args: {
    children: "Tree placeholder",
    style: {
      padding: 16,
      border: "1px dashed currentColor",
    },
  },
};


