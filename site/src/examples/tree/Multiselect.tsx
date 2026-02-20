import { Tree, TreeNode } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Multiselect = (): ReactElement => (
  <Tree
    aria-label="File browser"
    multiselect
    defaultExpanded={["documents", "reports"]}
    style={{ width: "30ch" }}
  >
    <TreeNode value="documents" label="Documents">
      <TreeNode value="reports" label="Reports">
        <TreeNode value="annual-report" label="Annual Report" />
        <TreeNode value="quarterly-report" label="Quarterly Report" />
      </TreeNode>
      <TreeNode value="invoices" label="Invoices">
        <TreeNode value="invoice-001" label="Invoice 001" />
        <TreeNode value="invoice-002" label="Invoice 002" />
      </TreeNode>
    </TreeNode>
    <TreeNode value="pictures" label="Pictures">
      <TreeNode value="vacation" label="Vacation">
        <TreeNode value="beach" label="Beach" />
        <TreeNode value="mountains" label="Mountains" />
      </TreeNode>
    </TreeNode>
    <TreeNode value="downloads" label="Downloads" />
  </Tree>
);
