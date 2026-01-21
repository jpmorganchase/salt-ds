import { Tooltip } from "@salt-ds/core";
import { Tree, TreeNode, TreeNodeLabel, TreeNodeTrigger } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithTooltip = (): ReactElement => (
  <Tree
    aria-label="File browser"
    defaultExpanded={["documents"]}
    style={{ width: "30ch" }}
  >
    <TreeNode value="documents">
      <Tooltip content="Contains all document files" placement="right">
        <TreeNodeTrigger>
          <TreeNodeLabel>Documents</TreeNodeLabel>
        </TreeNodeTrigger>
      </Tooltip>
      <TreeNode value="reports">
        <Tooltip content="Financial reports folder" placement="right">
          <TreeNodeTrigger>
            <TreeNodeLabel>Reports</TreeNodeLabel>
          </TreeNodeTrigger>
        </Tooltip>
        <TreeNode value="annual-report" label="Annual Report" />
        <TreeNode value="quarterly-report" label="Quarterly Report" />
      </TreeNode>
      <TreeNode value="invoices" label="Invoices">
        <TreeNode value="invoice-001" label="Invoice 001" />
        <TreeNode value="invoice-002" label="Invoice 002" />
      </TreeNode>
    </TreeNode>
    <TreeNode value="pictures">
      <Tooltip content="Image files and photos" placement="right">
        <TreeNodeTrigger>
          <TreeNodeLabel>Pictures</TreeNodeLabel>
        </TreeNodeTrigger>
      </Tooltip>
      <TreeNode value="vacation" label="Vacation">
        <TreeNode value="beach" label="Beach" />
        <TreeNode value="mountains" label="Mountains" />
      </TreeNode>
    </TreeNode>
    <TreeNode value="downloads" label="Downloads" />
  </Tree>
);
