import { StackLayout } from "@salt-ds/core";
import { Tree, TreeNode } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <StackLayout direction="row" gap={6}>
    <Tree aria-label="Disabled tree" disabled defaultExpanded={["documents"]}>
      <TreeNode value="documents" label="Documents">
        <TreeNode value="reports" label="Reports">
          <TreeNode value="annual-report" label="Annual Report" />
        </TreeNode>
      </TreeNode>
      <TreeNode value="pictures" label="Pictures" />
    </Tree>
    <Tree aria-label="Tree with disabled nodes" defaultExpanded={["documents"]}>
      <TreeNode value="documents" label="Documents">
        <TreeNode value="reports" label="Reports" disabled>
          <TreeNode value="annual-report" label="Annual Report" />
        </TreeNode>
        <TreeNode value="invoices" label="Invoices">
          <TreeNode value="invoice-001" label="Invoice 001" disabled />
          <TreeNode value="invoice-002" label="Invoice 002" />
        </TreeNode>
      </TreeNode>
      <TreeNode value="pictures" label="Pictures" />
    </Tree>
  </StackLayout>
);
