import { StackLayout, Text } from "@salt-ds/core";
import { Tree, TreeNode } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const Multiselect = (): ReactElement => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <StackLayout>
      <Text>
        Selected: {selected.length > 0 ? selected.join(", ") : "none"}
      </Text>
      <Tree
        aria-label="File browser"
        multiselect
        defaultExpanded={["documents", "reports"]}
        selected={selected}
        onSelectionChange={(_, newSelected) => setSelected(newSelected)}
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
    </StackLayout>
  );
};
