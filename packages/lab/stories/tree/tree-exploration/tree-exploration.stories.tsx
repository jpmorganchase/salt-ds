import { DocumentIcon, FolderClosedIcon, FolderOpenIcon } from "@salt-ds/icons";
import { Tree, TreeNode } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { clsx } from "clsx";
import type { ComponentProps } from "react";

type TreeStoryProps = ComponentProps<typeof Tree> & {
  withoutChevronSpacing?: boolean;
  alignLeafLabels?: boolean;
};

export default {
  title: "Lab/Tree/Icon Scenarios",
  component: Tree,
  parameters: {
    controls: {
      sort: "none",
    },
  },
  argTypes: {
    multiselect: {
      control: { type: "boolean" },
    },
    withoutChevronSpacing: {
      control: { type: "boolean" },
    },
    alignLeafLabels: {
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
  },
  args: {
    multiselect: false,
    withoutChevronSpacing: false,
    alignLeafLabels: false,
    disabled: false,
    propagateSelect: true,
    propagateSelectUpwards: true,
  },
} as Meta<typeof Tree>;

export const MixedIcons: StoryFn<TreeStoryProps> = ({
  withoutChevronSpacing,
  alignLeafLabels,
  ...args
}) => (
  <Tree
    {...args}
    className={clsx({
      "saltTree--compactLeafs": withoutChevronSpacing,
      "saltTree--alignLeafLabels": alignLeafLabels,
    })}
    aria-label="File browser"
    defaultExpanded={["documents"]}
  >
    <TreeNode value="documents" label="Documents" icon={FolderOpenIcon}>
      <TreeNode value="reports" label="Reports">
        <TreeNode
          value="annual-report"
          label="Annual Report"
          icon={DocumentIcon}
        />
        <TreeNode value="quarterly-report" label="Quarterly Report">
          <TreeNode value="q1-report" label="Q1 Report" icon={DocumentIcon} />
          <TreeNode value="q2-report" label="Q2 Report" />
        </TreeNode>
      </TreeNode>
      <TreeNode value="invoices" label="Invoices" icon={FolderClosedIcon}>
        <TreeNode value="invoice-001" label="Invoice 001" icon={DocumentIcon} />
        <TreeNode
          value="invoice-002"
          label="Invoice 002"
          icon={FolderClosedIcon}
        >
          <TreeNode value="invoice-002-a" label="Invoice 002-A" />
          <TreeNode
            value="invoice-002-b"
            label="Invoice 002-B"
            icon={DocumentIcon}
          />
        </TreeNode>
      </TreeNode>
    </TreeNode>
    <TreeNode value="pictures" label="Pictures">
      <TreeNode value="vacation" label="Vacation" icon={FolderClosedIcon}>
        <TreeNode value="beach" label="Beach" icon={DocumentIcon} />
        <TreeNode value="mountains" label="Mountains" />
      </TreeNode>
    </TreeNode>
    <TreeNode value="downloads" label="Downloads" icon={FolderClosedIcon} />
  </Tree>
);

export const NoIcons: StoryFn<TreeStoryProps> = ({
  withoutChevronSpacing,
  alignLeafLabels,
  ...args
}) => (
  <Tree
    {...args}
    className={clsx({
      "saltTree--compactLeafs": withoutChevronSpacing,
      "saltTree--alignLeafLabels": alignLeafLabels,
    })}
    aria-label="File browser"
    defaultExpanded={["documents"]}
  >
    <TreeNode value="documents" label="Documents">
      <TreeNode value="reports" label="Reports">
        <TreeNode value="annual-report" label="Annual Report" />
        <TreeNode value="quarterly-report" label="Quarterly Report">
          <TreeNode value="q1-report" label="Q1 Report" />
          <TreeNode value="q2-report" label="Q2 Report" />
        </TreeNode>
      </TreeNode>
      <TreeNode value="invoices" label="Invoices">
        <TreeNode value="invoice-001" label="Invoice 001" />
        <TreeNode value="invoice-002" label="Invoice 002">
          <TreeNode value="invoice-002-a" label="Invoice 002-A" />
          <TreeNode value="invoice-002-b" label="Invoice 002-B" />
        </TreeNode>
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

export const IconsOnlyOnParents: StoryFn<TreeStoryProps> = ({
  withoutChevronSpacing,
  alignLeafLabels,
  ...args
}) => (
  <Tree
    {...args}
    className={clsx({
      "saltTree--compactLeafs": withoutChevronSpacing,
      "saltTree--alignLeafLabels": alignLeafLabels,
    })}
    aria-label="File browser"
    defaultExpanded={["documents"]}
  >
    <TreeNode value="documents" label="Documents" icon={FolderOpenIcon}>
      <TreeNode value="reports" label="Reports" icon={FolderClosedIcon}>
        <TreeNode
          value="quarterly-report"
          label="Quarterly Report"
          icon={FolderClosedIcon}
        >
          <TreeNode value="q1-report" label="Q1 Report" />
          <TreeNode value="q2-report" label="Q2 Report" />
        </TreeNode>
        <TreeNode value="annual-report" label="Annual Report" />
      </TreeNode>
      <TreeNode value="invoices" label="Invoices" icon={FolderClosedIcon}>
        <TreeNode value="invoice-001" label="Invoice 001" />
        <TreeNode
          value="invoice-002"
          label="Invoice 002"
          icon={FolderClosedIcon}
        >
          <TreeNode value="invoice-002-a" label="Invoice 002-A" />
          <TreeNode value="invoice-002-b" label="Invoice 002-B" />
        </TreeNode>
      </TreeNode>
    </TreeNode>
    <TreeNode value="pictures" label="Pictures" icon={FolderClosedIcon}>
      <TreeNode value="vacation" label="Vacation" icon={FolderClosedIcon}>
        <TreeNode value="beach" label="Beach" />
        <TreeNode value="mountains" label="Mountains" />
      </TreeNode>
    </TreeNode>
    <TreeNode value="downloads" label="Downloads" />
  </Tree>
);

export const IconsOnlyOnLeafNodes: StoryFn<TreeStoryProps> = ({
  withoutChevronSpacing,
  alignLeafLabels,
  ...args
}) => (
  <Tree
    {...args}
    className={clsx({
      "saltTree--compactLeafs": withoutChevronSpacing,
      "saltTree--alignLeafLabels": alignLeafLabels,
    })}
    aria-label="File browser"
    defaultExpanded={["documents"]}
  >
    <TreeNode value="documents" label="Documents">
      <TreeNode value="reports" label="Reports">
        <TreeNode
          value="annual-report"
          label="Annual Report"
          icon={DocumentIcon}
        />
        <TreeNode value="quarterly-report" label="Quarterly Report">
          <TreeNode value="q1-report" label="Q1 Report" icon={DocumentIcon} />
          <TreeNode value="q2-report" label="Q2 Report" icon={DocumentIcon} />
        </TreeNode>
      </TreeNode>
      <TreeNode value="invoices" label="Invoices">
        <TreeNode value="invoice-001" label="Invoice 001" icon={DocumentIcon} />
        <TreeNode value="invoice-002" label="Invoice 002">
          <TreeNode
            value="invoice-002-a"
            label="Invoice 002-A"
            icon={DocumentIcon}
          />
          <TreeNode
            value="invoice-002-b"
            label="Invoice 002-B"
            icon={DocumentIcon}
          />
        </TreeNode>
      </TreeNode>
    </TreeNode>
    <TreeNode value="pictures" label="Pictures">
      <TreeNode value="vacation" label="Vacation">
        <TreeNode value="beach" label="Beach" icon={DocumentIcon} />
        <TreeNode value="mountains" label="Mountains" icon={DocumentIcon} />
      </TreeNode>
    </TreeNode>
  </Tree>
);

export const IconsOnAllNodes: StoryFn<TreeStoryProps> = ({
  withoutChevronSpacing,
  alignLeafLabels,
  ...args
}) => (
  <Tree
    {...args}
    className={clsx({
      "saltTree--compactLeafs": withoutChevronSpacing,
      "saltTree--alignLeafLabels": alignLeafLabels,
    })}
    aria-label="File browser"
    defaultExpanded={["documents"]}
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
          icon={FolderClosedIcon}
        >
          <TreeNode value="q1-report" label="Q1 Report" icon={DocumentIcon} />
          <TreeNode value="q2-report" label="Q2 Report" icon={DocumentIcon} />
        </TreeNode>
      </TreeNode>
      <TreeNode value="invoices" label="Invoices" icon={FolderClosedIcon}>
        <TreeNode value="invoice-001" label="Invoice 001" icon={DocumentIcon} />
        <TreeNode
          value="invoice-002"
          label="Invoice 002"
          icon={FolderClosedIcon}
        >
          <TreeNode
            value="invoice-002-a"
            label="Invoice 002-A"
            icon={DocumentIcon}
          />
          <TreeNode
            value="invoice-002-b"
            label="Invoice 002-B"
            icon={DocumentIcon}
          />
        </TreeNode>
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
