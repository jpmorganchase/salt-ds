// import { DocumentIcon, FolderClosedIcon, FolderOpenIcon } from "@salt-ds/icons";
import { Tree, TreeNode } from "@salt-ds/lab";
import type { Meta, StoryObj } from "@storybook/react";

// import { useState } from "react";

const meta: Meta<typeof Tree> = {
  title: "Lab/Tree",
  component: Tree,
};

export default meta;

type Story = StoryObj<typeof Tree>;

export const Default: Story = {
  render: () => (
    <Tree aria-label="File browser" expanded={["documents"]}>
      <TreeNode value="heyo" label="hello" />
      <TreeNode value="everyone" label="yo" />
    </Tree>
  ),
};
