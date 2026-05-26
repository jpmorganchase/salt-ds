---
"@salt-ds/core": minor
---

Added `Tree`, `TreeNode`, `TreeNodeTrigger`, and `TreeNodeLabel`.

`Tree` displays hierarchical data as an expandable and collapsible structure. Users can navigate nested items and optionally select one or more nodes.

```tsx
<Tree aria-label="File browser" defaultExpanded={["documents"]}>
  <TreeNode value="documents" label="Documents">
    <TreeNode value="reports" label="Reports">
      <TreeNode value="annual-report" label="Annual Report" />
    </TreeNode>
  </TreeNode>
</Tree>
```
