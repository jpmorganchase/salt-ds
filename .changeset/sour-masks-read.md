---
"@salt-ds/lab": minor
---

## Summary

New `Tree`, `TreeNode`, and `TreeNodeTrigger` components for displaying hierarchical data with expand/collapse, selection, and keyboard navigation.

**What's included**

- Single and multi-select modes with optional checkbox variant
- Controlled and uncontrolled expanded/selected states
- Selection propagation to descendants and ancestors in multiselect mode
- Keyboard navigation (arrows, Home, End, Enter, Space, type-ahead)
- Disabled state at tree or individual node level
- Custom icons per node
- `TreeNodeTrigger` for custom row content (e.g. wrapping with `Tooltip`); use inside `TreeNode` when you need more than the default `label`

## Examples

**Basic Tree** — use `TreeNode` with the `label` prop, optionally including an `icon` prop

```tsx
import { FolderOpenIcon, FolderClosedIcon, DocumentIcon } from "@salt-ds/icons";
import { Tree, TreeNode } from "@salt-ds/lab";

<Tree aria-label="File browser" defaultExpanded={["documents"]}>
  <TreeNode value="documents" label="Documents" icon={FolderOpenIcon}>
    <TreeNode value="reports" label="Reports" icon={FolderClosedIcon}>
      <TreeNode
        value="annual-report"
        label="Annual Report"
        icon={DocumentIcon}
      />
      <TreeNode
        value="quarterly-report"
        label="Quarterly Report"
        icon={DocumentIcon}
      />
    </TreeNode>
    <TreeNode value="invoices" label="Invoices" icon={FolderClosedIcon}>
      <TreeNode value="invoice-001" label="Invoice 001" icon={DocumentIcon} />
      <TreeNode value="invoice-002" label="Invoice 002" icon={DocumentIcon} />
    </TreeNode>
  </TreeNode>
  <TreeNode value="downloads" label="Downloads" icon={FolderClosedIcon} />
</Tree>;
```

**Tree with Tooltip** — use `TreeNodeTrigger` and `TreeNodeLabel` inside `TreeNode` when you need to wrap the row (e.g. in a `Tooltip`). Icons can be passed as direct children of `TreeNodeTrigger`.

```tsx
import { Tooltip } from "@salt-ds/core";
import { FolderOpenIcon, FolderClosedIcon } from "@salt-ds/icons";
import { Tree, TreeNode, TreeNodeLabel, TreeNodeTrigger } from "@salt-ds/lab";

<Tree aria-label="File browser" defaultExpanded={["documents"]}>
  <TreeNode value="documents">
    <Tooltip content="Contains all document files" placement="right">
      <TreeNodeTrigger>
        <FolderOpenIcon aria-hidden />
        <TreeNodeLabel>Documents</TreeNodeLabel>
      </TreeNodeTrigger>
    </Tooltip>
    <TreeNode value="reports">
      <Tooltip content="Financial reports folder" placement="right">
        <TreeNodeTrigger>
          <FolderClosedIcon aria-hidden />
          <TreeNodeLabel>Reports</TreeNodeLabel>
        </TreeNodeTrigger>
      </Tooltip>
      <TreeNode value="annual-report" label="Annual Report" />
      <TreeNode value="quarterly-report" label="Quarterly Report" />
    </TreeNode>
  </TreeNode>
  <TreeNode value="downloads" label="Downloads" />
</Tree>;
```
