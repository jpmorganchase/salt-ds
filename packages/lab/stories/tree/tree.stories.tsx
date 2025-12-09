import { DocumentIcon, FolderClosedIcon, FolderOpenIcon } from "@salt-ds/icons";
import { Tree, TreeNode } from "@salt-ds/lab";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta: Meta<typeof Tree> = {
  title: "Lab/Tree",
  component: Tree,
};

export default meta;

type Story = StoryObj<typeof Tree>;

export const Default: Story = {
  render: () => (
    <Tree aria-label="File browser" defaultExpanded={["documents"]}>
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
  ),
};

export const WithIcons: Story = {
  render: () => {
    const FolderIcon = ({ expanded }: { expanded?: boolean }) =>
      expanded ? <FolderOpenIcon /> : <FolderClosedIcon />;

    return (
      <Tree aria-label="File browser" defaultExpanded={["documents"]}>
        <TreeNode
          value="documents"
          label="Documents"
          icon={<FolderIcon expanded />}
        >
          <TreeNode value="reports" label="Reports" icon={<FolderClosedIcon />}>
            <TreeNode
              value="annual-report"
              label="Annual Report"
              icon={<DocumentIcon />}
            />
            <TreeNode
              value="quarterly-report"
              label="Quarterly Report"
              icon={<DocumentIcon />}
            />
          </TreeNode>
          <TreeNode
            value="invoices"
            label="Invoices"
            icon={<FolderClosedIcon />}
          >
            <TreeNode
              value="invoice-001"
              label="Invoice 001"
              icon={<DocumentIcon />}
            />
            <TreeNode
              value="invoice-002"
              label="Invoice 002"
              icon={<DocumentIcon />}
            />
          </TreeNode>
        </TreeNode>
        <TreeNode value="pictures" label="Pictures" icon={<FolderClosedIcon />}>
          <TreeNode
            value="vacation"
            label="Vacation"
            icon={<FolderClosedIcon />}
          >
            <TreeNode value="beach" label="Beach" icon={<DocumentIcon />} />
            <TreeNode
              value="mountains"
              label="Mountains"
              icon={<DocumentIcon />}
            />
          </TreeNode>
        </TreeNode>
        <TreeNode
          value="downloads"
          label="Downloads"
          icon={<FolderClosedIcon />}
        />
      </Tree>
    );
  },
};

export const Checkbox: Story = {
  render: () => (
    <Tree aria-label="File browser" checkbox defaultExpanded={["documents"]}>
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
  ),
};

export const CheckboxWithIcons: Story = {
  render: () => (
    <Tree aria-label="File browser" checkbox defaultExpanded={["documents"]}>
      <TreeNode value="documents" label="Documents" icon={<FolderOpenIcon />}>
        <TreeNode value="reports" label="Reports" icon={<FolderClosedIcon />}>
          <TreeNode
            value="annual-report"
            label="Annual Report"
            icon={<DocumentIcon />}
          />
          <TreeNode
            value="quarterly-report"
            label="Quarterly Report"
            icon={<DocumentIcon />}
          />
        </TreeNode>
        <TreeNode value="invoices" label="Invoices" icon={<FolderClosedIcon />}>
          <TreeNode
            value="invoice-001"
            label="Invoice 001"
            icon={<DocumentIcon />}
          />
          <TreeNode
            value="invoice-002"
            label="Invoice 002"
            icon={<DocumentIcon />}
          />
        </TreeNode>
      </TreeNode>
      <TreeNode value="pictures" label="Pictures" icon={<FolderClosedIcon />}>
        <TreeNode value="vacation" label="Vacation" icon={<FolderClosedIcon />}>
          <TreeNode value="beach" label="Beach" icon={<DocumentIcon />} />
          <TreeNode
            value="mountains"
            label="Mountains"
            icon={<DocumentIcon />}
          />
        </TreeNode>
      </TreeNode>
      <TreeNode
        value="downloads"
        label="Downloads"
        icon={<FolderClosedIcon />}
      />
    </Tree>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [expanded, setExpanded] = useState<string[]>(["documents"]);
    const [selected, setSelected] = useState<string[]>(["annual-report"]);

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <strong>Expanded:</strong> {expanded.join(", ") || "none"}
          <br />
          <strong>Selected:</strong> {selected.join(", ") || "none"}
        </div>
        <Tree
          aria-label="File browser"
          expanded={expanded}
          onExpandedChange={(_, newExpanded) => setExpanded(newExpanded)}
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
      </div>
    );
  },
};

export const MultiSelect: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <strong>Selected:</strong> {selected.join(", ") || "none"}
        </div>
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
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <Tree aria-label="File browser" disabled defaultExpanded={["documents"]}>
      <TreeNode value="documents" label="Documents">
        <TreeNode value="reports" label="Reports">
          <TreeNode value="annual-report" label="Annual Report" />
        </TreeNode>
      </TreeNode>
      <TreeNode value="pictures" label="Pictures" />
    </Tree>
  ),
};

export const DisabledNodes: Story = {
  render: () => (
    <Tree aria-label="File browser" defaultExpanded={["documents"]}>
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
  ),
};

export const LongLabels: Story = {
  render: () => (
    <Tree
      aria-label="File browser"
      defaultExpanded={["documents"]}
      style={{ maxWidth: 300 }}
    >
      <TreeNode
        value="documents"
        label="Documents with a very long label that should wrap onto multiple lines"
      >
        <TreeNode
          value="reports"
          label="This is a report folder with an exceptionally long name that demonstrates text wrapping behavior"
        >
          <TreeNode
            value="annual-report"
            label="Annual Report 2024 - Financial Summary and Analysis"
          />
        </TreeNode>
      </TreeNode>
      <TreeNode value="pictures" label="Pictures" />
    </Tree>
  ),
};
