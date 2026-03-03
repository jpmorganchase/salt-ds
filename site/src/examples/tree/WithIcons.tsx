import { DocumentIcon, FolderClosedIcon, FolderOpenIcon } from "@salt-ds/icons";
import { Tree, TreeNode } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const WithIcons = (): ReactElement => {
  const [expanded, setExpanded] = useState(["documents"]);

  const folderIcon = (nodeValue: string) =>
    expanded.includes(nodeValue) ? FolderOpenIcon : FolderClosedIcon;

  return (
    <Tree
      aria-label="File browser"
      expanded={expanded}
      onExpandedChange={(_, newExpanded) => setExpanded(newExpanded)}
      style={{ width: "30ch" }}
    >
      <TreeNode
        value="documents"
        label="Documents"
        icon={folderIcon("documents")}
      >
        <TreeNode value="reports" label="Reports" icon={folderIcon("reports")}>
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
        <TreeNode
          value="invoices"
          label="Invoices"
          icon={folderIcon("invoices")}
        >
          <TreeNode
            value="invoice-001"
            label="Invoice 001"
            icon={DocumentIcon}
          />
          <TreeNode
            value="invoice-002"
            label="Invoice 002"
            icon={DocumentIcon}
          />
        </TreeNode>
      </TreeNode>
      <TreeNode value="pictures" label="Pictures" icon={folderIcon("pictures")}>
        <TreeNode
          value="vacation"
          label="Vacation"
          icon={folderIcon("vacation")}
        >
          <TreeNode value="beach" label="Beach" icon={DocumentIcon} />
          <TreeNode value="mountains" label="Mountains" icon={DocumentIcon} />
        </TreeNode>
      </TreeNode>
      <TreeNode value="downloads" label="Downloads" icon={FolderClosedIcon} />
    </Tree>
  );
};
