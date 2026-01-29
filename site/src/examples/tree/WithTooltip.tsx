import { Tooltip } from "@salt-ds/core";
import { DocumentIcon, FolderClosedIcon, FolderOpenIcon } from "@salt-ds/icons";
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
    <TreeNode value="pictures">
      <Tooltip content="Image files and photos" placement="right">
        <TreeNodeTrigger>
          <FolderClosedIcon aria-hidden />
          <TreeNodeLabel>Pictures</TreeNodeLabel>
        </TreeNodeTrigger>
      </Tooltip>
      <TreeNode value="vacation" label="Vacation" icon={FolderClosedIcon}>
        <TreeNode value="beach" label="Beach" icon={DocumentIcon} />
        <TreeNode value="mountains" label="Mountains" icon={DocumentIcon} />
      </TreeNode>
    </TreeNode>
    <TreeNode value="downloads" label="Downloads" icon={FolderClosedIcon} />
  </Tree>
);
