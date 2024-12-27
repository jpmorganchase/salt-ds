import { Tree, TreeNode } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Tree",
  component: Tree,
  subcomponents: { TreeNode },
} as Meta<typeof Tree>;

export const Basic: StoryFn<typeof Tree> = () => (
  <Tree>
    <TreeNode label="Tree.tsx" />
    <TreeNode label="TreeNode.tsx" />
    <TreeNode label="index.ts" />
  </Tree>
);

export const Depth1: StoryFn<typeof Tree> = () => (
  <Tree>
    <TreeNode label="Tree">
      <TreeNode label="Tree.tsx" />
      <TreeNode label="TreeNode.tsx" />
      <TreeNode label="index.ts" />
    </TreeNode>
  </Tree>
);

export const Depth2: StoryFn<typeof Tree> = () => (
  <Tree>
    <TreeNode label="components">
      <TreeNode label="Tree">
        <TreeNode label="Tree.tsx" />
        <TreeNode label="TreeNode.tsx" />
        <TreeNode label="index.ts" />
      </TreeNode>
      <TreeNode label="Button">
        <TreeNode label="index.ts" />
      </TreeNode>
    </TreeNode>
  </Tree>
);
