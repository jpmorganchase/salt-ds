import { Tooltip } from "@salt-ds/core";
import { DocumentIcon, FolderClosedIcon, FolderOpenIcon } from "@salt-ds/icons";
import { Tree, TreeNode } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Lab/Tree",
  component: Tree,
  argTypes: {
    multiselect: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    propagateSelect: {
      control: { type: "boolean" },
    },
    propagateSelectUpwards: {
      control: { type: "boolean" },
    },
    togglableSelect: {
      control: { type: "boolean" },
    },
  },
  args: {
    multiselect: false,
    disabled: false,
    propagateSelect: true,
    propagateSelectUpwards: true,
    togglableSelect: false,
  },
} as Meta<typeof Tree>;

const DefaultStory: StoryFn<typeof Tree> = (args) => (
  <Tree aria-label="File browser" defaultExpanded={["documents"]} {...args}>
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
export const Default = DefaultStory.bind({});

const FolderIcon = ({ expanded }: { expanded?: boolean }) =>
  expanded ? <FolderOpenIcon /> : <FolderClosedIcon />;

export const WithIcons: StoryFn<typeof Tree> = (args) => (
  <Tree aria-label="File browser" defaultExpanded={["documents"]} {...args}>
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
        <TreeNode value="mountains" label="Mountains" icon={<DocumentIcon />} />
      </TreeNode>
    </TreeNode>
    <TreeNode value="downloads" label="Downloads" icon={<FolderClosedIcon />} />
  </Tree>
);

export const MultiselectWithIcons: StoryFn<typeof Tree> = (args) => (
  <Tree
    aria-label="File browser"
    multiselect
    defaultExpanded={["documents"]}
    defaultSelected={["annual-report"]}
  >
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
        <TreeNode value="mountains" label="Mountains" icon={<DocumentIcon />} />
      </TreeNode>
    </TreeNode>
    <TreeNode value="downloads" label="Downloads" icon={<FolderClosedIcon />} />
  </Tree>
);
MultiselectWithIcons.args = {
  multiselect: true,
};

export const Controlled: StoryFn<typeof Tree> = (args) => {
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
        {...args}
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
};

export const MultiSelect: StoryFn<typeof Tree> = (args) => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <strong>Selected:</strong> {selected.join(", ") || "none"}
      </div>
      <Tree
        {...args}
        aria-label="File browser"
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
};
MultiSelect.args = {
  multiselect: true,
};

export const Disabled: StoryFn<typeof Tree> = (args) => (
  <Tree {...args} aria-label="File browser" defaultExpanded={["documents"]}>
    <TreeNode value="documents" label="Documents">
      <TreeNode value="reports" label="Reports">
        <TreeNode value="annual-report" label="Annual Report" />
      </TreeNode>
    </TreeNode>
    <TreeNode value="pictures" label="Pictures" />
  </Tree>
);
Disabled.args = {
  disabled: true,
};

export const DisabledNodes: StoryFn<typeof Tree> = (args) => (
  <Tree {...args} aria-label="File browser" defaultExpanded={["documents"]}>
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

export const LongLabels: StoryFn<typeof Tree> = (args) => (
  <Tree
    {...args}
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
);

const tooltipLabelStyle = {
  display: "block",
  marginRight: "calc(-1 * var(--salt-spacing-100))",
  paddingRight: "var(--salt-spacing-100)",
};

export const WithTooltip: StoryFn<typeof Tree> = (args) => (
  <Tree {...args} aria-label="File browser" defaultExpanded={["documents"]}>
    <TreeNode
      value="documents"
      label={
        <Tooltip content="Contains all document files">
          <span style={tooltipLabelStyle}>Documents</span>
        </Tooltip>
      }
    >
      <TreeNode
        value="reports"
        label={
          <Tooltip content="Financial reports folder">
            <span style={tooltipLabelStyle}>Reports</span>
          </Tooltip>
        }
      >
        <TreeNode value="annual-report" label="Annual Report" />
        <TreeNode value="quarterly-report" label="Quarterly Report" />
      </TreeNode>
      <TreeNode value="invoices" label="Invoices">
        <TreeNode value="invoice-001" label="Invoice 001" />
        <TreeNode value="invoice-002" label="Invoice 002" />
      </TreeNode>
    </TreeNode>
    <TreeNode
      value="pictures"
      label={
        <Tooltip content="Image files and photos">
          <span style={tooltipLabelStyle}>Pictures</span>
        </Tooltip>
      }
    >
      <TreeNode value="vacation" label="Vacation">
        <TreeNode value="beach" label="Beach" />
        <TreeNode value="mountains" label="Mountains" />
      </TreeNode>
    </TreeNode>
    <TreeNode value="downloads" label="Downloads" />
  </Tree>
);
