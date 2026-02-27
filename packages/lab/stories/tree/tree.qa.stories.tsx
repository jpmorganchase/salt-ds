import { DocumentIcon, FolderClosedIcon, FolderOpenIcon } from "@salt-ds/icons";
import { Tree, TreeNode } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Tree/Tree QA",
  component: Tree,
} as Meta<typeof Tree>;

export const AllExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={4} itemPadding={10} transposeDensity width={2200}>
    <Tree aria-label="Default tree" defaultExpanded={["documents", "reports"]}>
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
        </TreeNode>
      </TreeNode>
      <TreeNode value="downloads" label="Downloads" />
    </Tree>

    <Tree
      aria-label="Tree with icons"
      defaultExpanded={["documents", "reports"]}
    >
      <TreeNode value="documents" label="Documents" icon={FolderOpenIcon}>
        <TreeNode value="reports" label="Reports" icon={FolderOpenIcon}>
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
          <TreeNode
            value="invoice-001"
            label="Invoice 001"
            icon={DocumentIcon}
          />
        </TreeNode>
      </TreeNode>
      <TreeNode value="pictures" label="Pictures" icon={FolderClosedIcon}>
        <TreeNode value="vacation" label="Vacation" icon={FolderClosedIcon}>
          <TreeNode value="beach" label="Beach" icon={DocumentIcon} />
        </TreeNode>
      </TreeNode>
    </Tree>

    <Tree
      aria-label="Mixed expanded tree"
      defaultExpanded={["documents", "invoices"]}
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
        </TreeNode>
      </TreeNode>
    </Tree>

    <Tree
      aria-label="Checkbox tree"
      multiselect
      defaultExpanded={["documents", "reports"]}
      defaultSelected={["annual-report"]}
    >
      <TreeNode value="documents" label="Documents">
        <TreeNode value="reports" label="Reports">
          <TreeNode value="annual-report" label="Annual Report" />
          <TreeNode value="quarterly-report" label="Quarterly Report" />
        </TreeNode>
        <TreeNode value="invoices" label="Invoices">
          <TreeNode value="invoice-001" label="Invoice 001" />
        </TreeNode>
      </TreeNode>
      <TreeNode value="pictures" label="Pictures">
        <TreeNode value="vacation" label="Vacation">
          <TreeNode value="beach" label="Beach" />
        </TreeNode>
      </TreeNode>
    </Tree>

    <Tree
      aria-label="Checkbox tree with icons"
      multiselect
      defaultExpanded={["documents", "reports"]}
      defaultSelected={["annual-report"]}
    >
      <TreeNode value="documents" label="Documents" icon={FolderOpenIcon}>
        <TreeNode value="reports" label="Reports" icon={FolderOpenIcon}>
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
          <TreeNode
            value="invoice-001"
            label="Invoice 001"
            icon={DocumentIcon}
          />
        </TreeNode>
      </TreeNode>
      <TreeNode value="pictures" label="Pictures" icon={FolderClosedIcon}>
        <TreeNode value="vacation" label="Vacation" icon={FolderClosedIcon}>
          <TreeNode value="beach" label="Beach" icon={DocumentIcon} />
        </TreeNode>
      </TreeNode>
    </Tree>

    <Tree
      aria-label="Multiselect tree"
      multiselect
      defaultExpanded={["documents", "reports"]}
      defaultSelected={["annual-report", "quarterly-report"]}
    >
      <TreeNode value="documents" label="Documents">
        <TreeNode value="reports" label="Reports">
          <TreeNode value="annual-report" label="Annual Report" />
          <TreeNode value="quarterly-report" label="Quarterly Report" />
        </TreeNode>
        <TreeNode value="invoices" label="Invoices">
          <TreeNode value="invoice-001" label="Invoice 001" />
        </TreeNode>
      </TreeNode>
      <TreeNode value="pictures" label="Pictures">
        <TreeNode value="vacation" label="Vacation">
          <TreeNode value="beach" label="Beach" />
        </TreeNode>
      </TreeNode>
    </Tree>

    <Tree
      aria-label="Disabled tree"
      disabled
      defaultExpanded={["documents", "reports"]}
    >
      <TreeNode value="documents" label="Documents">
        <TreeNode value="reports" label="Reports">
          <TreeNode value="annual-report" label="Annual Report" />
        </TreeNode>
        <TreeNode value="invoices" label="Invoices">
          <TreeNode value="invoice-001" label="Invoice 001" />
        </TreeNode>
      </TreeNode>
      <TreeNode value="pictures" label="Pictures">
        <TreeNode value="vacation" label="Vacation">
          <TreeNode value="beach" label="Beach" />
        </TreeNode>
      </TreeNode>
    </Tree>

    <Tree
      aria-label="Tree with disabled nodes"
      defaultExpanded={["documents", "reports", "invoices"]}
    >
      <TreeNode value="documents" label="Documents">
        <TreeNode value="reports" label="Reports" disabled>
          <TreeNode value="annual-report" label="Annual Report" />
          <TreeNode value="quarterly-report" label="Quarterly Report" />
        </TreeNode>
        <TreeNode value="invoices" label="Invoices">
          <TreeNode value="invoice-001" label="Invoice 001" disabled />
          <TreeNode value="invoice-002" label="Invoice 002" />
        </TreeNode>
      </TreeNode>
      <TreeNode value="pictures" label="Pictures">
        <TreeNode value="vacation" label="Vacation">
          <TreeNode value="beach" label="Beach" />
        </TreeNode>
      </TreeNode>
    </Tree>

    <Tree
      aria-label="Tree with long labels"
      defaultExpanded={["documents", "reports"]}
      style={{ maxWidth: 200 }}
    >
      <TreeNode
        value="documents"
        label="Documents with a very long label that wraps"
      >
        <TreeNode value="reports" label="Reports folder with long name">
          <TreeNode value="annual-report" label="Annual Report 2024" />
          <TreeNode value="quarterly-report" label="Q4 Report" />
        </TreeNode>
        <TreeNode value="invoices" label="Invoices">
          <TreeNode value="invoice-001" label="Invoice 001" />
        </TreeNode>
      </TreeNode>
      <TreeNode value="pictures" label="Pictures">
        <TreeNode value="vacation" label="Vacation Photos">
          <TreeNode value="beach" label="Beach Trip" />
        </TreeNode>
      </TreeNode>
    </Tree>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
