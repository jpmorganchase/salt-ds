import { Tree, TreeNode } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const DisabledNodes = (): ReactElement => (
  <Tree
    aria-label="File browser"
    defaultExpanded={["documents"]}
    style={{ width: "30ch" }}
  >
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
);
