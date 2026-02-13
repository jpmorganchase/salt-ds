import { DocumentIcon, FolderClosedIcon, FolderOpenIcon } from "@salt-ds/icons";
import { Tree, TreeNode } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithIcons = (): ReactElement => (
  <Tree
    aria-label="File browser"
    defaultExpanded={["documents"]}
    style={{ width: "30ch" }}
  >
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
    <TreeNode value="pictures" label="Pictures" icon={FolderClosedIcon}>
      <TreeNode value="vacation" label="Vacation" icon={FolderClosedIcon}>
        <TreeNode value="beach" label="Beach" icon={DocumentIcon} />
        <TreeNode value="mountains" label="Mountains" icon={DocumentIcon} />
      </TreeNode>
    </TreeNode>
    <TreeNode value="downloads" label="Downloads" icon={FolderClosedIcon} />
  </Tree>
);
