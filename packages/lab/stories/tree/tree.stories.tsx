import { Tooltip } from "@salt-ds/core";
import { DocumentIcon, FolderClosedIcon, FolderOpenIcon } from "@salt-ds/icons";
import { Tree, TreeNode, TreeNodeLabel, TreeNodeTrigger } from "@salt-ds/lab";
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
  },
  args: {
    multiselect: false,
    disabled: false,
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

export const WithIcons: StoryFn<typeof Tree> = (args) => {
  const [expanded, setExpanded] = useState(["documents"]);

  const folderIcon = (nodeValue: string) =>
    expanded.includes(nodeValue) ? FolderOpenIcon : FolderClosedIcon;

  return (
    <Tree
      {...args}
      aria-label="File browser"
      expanded={expanded}
      onExpandedChange={(_, newExpanded) => setExpanded(newExpanded)}
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

export const Multiselect: StoryFn<typeof Tree> = (args) => (
  <Tree
    {...args}
    aria-label="File browser"
    multiselect
    defaultExpanded={["documents", "reports"]}
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

export const MultiselectWithIcons: StoryFn<typeof Tree> = () => (
  <Tree
    aria-label="File browser"
    multiselect
    defaultExpanded={["documents"]}
    defaultSelected={["annual-report"]}
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
MultiselectWithIcons.args = {
  multiselect: true,
};

export const ControlledSingleSelect: StoryFn<typeof Tree> = (args) => {
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

export const ControlledMultiselect: StoryFn<typeof Tree> = (args) => {
  const [expanded, setExpanded] = useState<string[]>(["documents", "reports"]);
  const [selected, setSelected] = useState<string[]>([]);

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
ControlledMultiselect.args = {
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

export const DisabledSelected: StoryFn<typeof Tree> = (args) => (
  <Tree
    {...args}
    aria-label="File browser"
    multiselect
    defaultExpanded={["documents", "reports"]}
    defaultSelected={["annual-report", "quarterly-report", "invoice-001"]}
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
        <TreeNode value="mountains" label="Mountains" />
      </TreeNode>
    </TreeNode>
    <TreeNode value="downloads" label="Downloads" />
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

export const WithTooltip: StoryFn<typeof Tree> = (args) => (
  <Tree {...args} aria-label="File browser" defaultExpanded={["documents"]}>
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

export const CompositionalWithIcons: StoryFn<typeof Tree> = (args) => (
  <Tree {...args} aria-label="File browser" defaultExpanded={["documents"]}>
    <TreeNode value="documents">
      <TreeNodeTrigger>
        <FolderOpenIcon aria-hidden />
        <TreeNodeLabel>Documents</TreeNodeLabel>
      </TreeNodeTrigger>
      <TreeNode value="reports">
        <TreeNodeTrigger>
          <FolderClosedIcon aria-hidden />
          <TreeNodeLabel>Reports</TreeNodeLabel>
        </TreeNodeTrigger>
        <TreeNode value="annual-report">
          <TreeNodeTrigger>
            <DocumentIcon aria-hidden />
            <TreeNodeLabel>Annual Report</TreeNodeLabel>
          </TreeNodeTrigger>
        </TreeNode>
        <TreeNode value="quarterly-report">
          <TreeNodeTrigger>
            <DocumentIcon aria-hidden />
            <TreeNodeLabel>Quarterly Report</TreeNodeLabel>
          </TreeNodeTrigger>
        </TreeNode>
      </TreeNode>
      <TreeNode value="invoices">
        <TreeNodeTrigger>
          <FolderClosedIcon aria-hidden />
          <TreeNodeLabel>Invoices</TreeNodeLabel>
        </TreeNodeTrigger>
        <TreeNode value="invoice-001">
          <TreeNodeTrigger>
            <DocumentIcon aria-hidden />
            <TreeNodeLabel>Invoice 001</TreeNodeLabel>
          </TreeNodeTrigger>
        </TreeNode>
        <TreeNode value="invoice-002">
          <TreeNodeTrigger>
            <DocumentIcon aria-hidden />
            <TreeNodeLabel>Invoice 002</TreeNodeLabel>
          </TreeNodeTrigger>
        </TreeNode>
      </TreeNode>
    </TreeNode>
    <TreeNode value="pictures">
      <TreeNodeTrigger>
        <FolderClosedIcon aria-hidden />
        <TreeNodeLabel>Pictures</TreeNodeLabel>
      </TreeNodeTrigger>
      <TreeNode value="vacation">
        <TreeNodeTrigger>
          <FolderClosedIcon aria-hidden />
          <TreeNodeLabel>Vacation</TreeNodeLabel>
        </TreeNodeTrigger>
        <TreeNode value="beach">
          <TreeNodeTrigger>
            <DocumentIcon aria-hidden />
            <TreeNodeLabel>Beach</TreeNodeLabel>
          </TreeNodeTrigger>
        </TreeNode>
        <TreeNode value="mountains">
          <TreeNodeTrigger>
            <DocumentIcon aria-hidden />
            <TreeNodeLabel>Mountains</TreeNodeLabel>
          </TreeNodeTrigger>
        </TreeNode>
      </TreeNode>
    </TreeNode>
    <TreeNode value="downloads">
      <TreeNodeTrigger>
        <FolderClosedIcon aria-hidden />
        <TreeNodeLabel>Downloads</TreeNodeLabel>
      </TreeNodeTrigger>
    </TreeNode>
  </Tree>
);

export const DeepNesting: StoryFn<typeof Tree> = (args) => (
  <Tree
    {...args}
    aria-label="Deep file hierarchy"
    defaultExpanded={["projects"]}
  >
    <TreeNode value="projects" label="Projects" icon={FolderOpenIcon}>
      <TreeNode
        value="project-alpha"
        label="Project Alpha"
        icon={FolderClosedIcon}
      >
        <TreeNode value="src" label="src" icon={FolderClosedIcon}>
          <TreeNode
            value="src-components"
            label="components"
            icon={FolderClosedIcon}
          >
            <TreeNode value="ui" label="ui" icon={FolderClosedIcon}>
              <TreeNode value="buttons" label="buttons" icon={FolderClosedIcon}>
                <TreeNode
                  value="buttons-primary"
                  label="primary"
                  icon={FolderClosedIcon}
                >
                  <TreeNode
                    value="buttons-primary-variants"
                    label="variants"
                    icon={FolderClosedIcon}
                  >
                    <TreeNode
                      value="buttons-primary-variants-large"
                      label="large"
                      icon={FolderClosedIcon}
                    >
                      <TreeNode
                        value="buttons-primary-variants-large-themes"
                        label="themes"
                        icon={FolderClosedIcon}
                      >
                        <TreeNode
                          value="buttons-primary-variants-large-themes-light"
                          label="light"
                          icon={FolderClosedIcon}
                        >
                          <TreeNode
                            value="buttons-primary-variants-large-themes-light-colors"
                            label="colors"
                            icon={FolderClosedIcon}
                          >
                            <TreeNode
                              value="buttons-primary-variants-large-themes-light-colors-primary"
                              label="primary"
                              icon={FolderClosedIcon}
                            >
                              <TreeNode
                                value="buttons-primary-variants-large-themes-light-colors-primary-shades"
                                label="shades"
                                icon={FolderClosedIcon}
                              >
                                <TreeNode
                                  value="buttons-primary-variants-large-themes-light-colors-primary-shades-light"
                                  label="light-shade"
                                  icon={FolderClosedIcon}
                                >
                                  <TreeNode
                                    value="buttons-primary-variants-large-themes-light-colors-primary-shades-light-tints"
                                    label="tints"
                                    icon={FolderClosedIcon}
                                  >
                                    <TreeNode
                                      value="buttons-primary-variants-large-themes-light-colors-primary-shades-light-tints-100"
                                      label="tint-100"
                                      icon={DocumentIcon}
                                    />
                                    <TreeNode
                                      value="buttons-primary-variants-large-themes-light-colors-primary-shades-light-tints-200"
                                      label="tint-200"
                                      icon={DocumentIcon}
                                    />
                                    <TreeNode
                                      value="buttons-primary-variants-large-themes-light-colors-primary-shades-light-tints-300"
                                      label="tint-300"
                                      icon={DocumentIcon}
                                    />
                                    <TreeNode
                                      value="buttons-primary-variants-large-themes-light-colors-primary-shades-light-tints-400"
                                      label="tint-400"
                                      icon={DocumentIcon}
                                    />
                                  </TreeNode>
                                </TreeNode>
                                <TreeNode
                                  value="buttons-primary-variants-large-themes-light-colors-primary-shades-medium"
                                  label="medium-shade"
                                  icon={FolderClosedIcon}
                                >
                                  <TreeNode
                                    value="buttons-primary-variants-large-themes-light-colors-primary-shades-medium-tints"
                                    label="tints"
                                    icon={FolderClosedIcon}
                                  >
                                    <TreeNode
                                      value="buttons-primary-variants-large-themes-light-colors-primary-shades-medium-tints-100"
                                      label="tint-100"
                                      icon={DocumentIcon}
                                    />
                                    <TreeNode
                                      value="buttons-primary-variants-large-themes-light-colors-primary-shades-medium-tints-200"
                                      label="tint-200"
                                      icon={DocumentIcon}
                                    />
                                  </TreeNode>
                                </TreeNode>
                                <TreeNode
                                  value="buttons-primary-variants-large-themes-light-colors-primary-shades-dark"
                                  label="dark-shade"
                                  icon={DocumentIcon}
                                />
                              </TreeNode>
                            </TreeNode>
                            <TreeNode
                              value="buttons-primary-variants-large-themes-light-colors-secondary"
                              label="secondary"
                              icon={FolderClosedIcon}
                            >
                              <TreeNode
                                value="buttons-primary-variants-large-themes-light-colors-secondary-blue"
                                label="blue"
                                icon={DocumentIcon}
                              />
                              <TreeNode
                                value="buttons-primary-variants-large-themes-light-colors-secondary-green"
                                label="green"
                                icon={DocumentIcon}
                              />
                              <TreeNode
                                value="buttons-primary-variants-large-themes-light-colors-secondary-red"
                                label="red"
                                icon={DocumentIcon}
                              />
                            </TreeNode>
                          </TreeNode>
                        </TreeNode>
                        <TreeNode
                          value="buttons-primary-variants-large-themes-dark"
                          label="dark"
                          icon={FolderClosedIcon}
                        >
                          <TreeNode
                            value="buttons-primary-variants-large-themes-dark-colors"
                            label="colors"
                            icon={FolderClosedIcon}
                          >
                            <TreeNode
                              value="buttons-primary-variants-large-themes-dark-colors-primary"
                              label="primary"
                              icon={DocumentIcon}
                            />
                            <TreeNode
                              value="buttons-primary-variants-large-themes-dark-colors-secondary"
                              label="secondary"
                              icon={DocumentIcon}
                            />
                          </TreeNode>
                        </TreeNode>
                      </TreeNode>
                    </TreeNode>
                    <TreeNode
                      value="buttons-primary-variants-medium"
                      label="medium"
                      icon={FolderClosedIcon}
                    >
                      <TreeNode
                        value="buttons-primary-variants-medium-themes"
                        label="themes"
                        icon={FolderClosedIcon}
                      >
                        <TreeNode
                          value="buttons-primary-variants-medium-themes-light"
                          label="light"
                          icon={DocumentIcon}
                        />
                        <TreeNode
                          value="buttons-primary-variants-medium-themes-dark"
                          label="dark"
                          icon={DocumentIcon}
                        />
                      </TreeNode>
                    </TreeNode>
                    <TreeNode
                      value="buttons-primary-variants-small"
                      label="small"
                      icon={DocumentIcon}
                    />
                  </TreeNode>
                </TreeNode>
                <TreeNode
                  value="buttons-secondary"
                  label="secondary"
                  icon={FolderClosedIcon}
                >
                  <TreeNode
                    value="buttons-secondary-variants"
                    label="variants"
                    icon={FolderClosedIcon}
                  >
                    <TreeNode
                      value="buttons-secondary-variants-large"
                      label="large"
                      icon={DocumentIcon}
                    />
                    <TreeNode
                      value="buttons-secondary-variants-medium"
                      label="medium"
                      icon={DocumentIcon}
                    />
                    <TreeNode
                      value="buttons-secondary-variants-small"
                      label="small"
                      icon={DocumentIcon}
                    />
                  </TreeNode>
                </TreeNode>
              </TreeNode>
              <TreeNode value="forms" label="forms" icon={FolderClosedIcon}>
                <TreeNode
                  value="forms-inputs"
                  label="inputs"
                  icon={FolderClosedIcon}
                >
                  <TreeNode
                    value="forms-inputs-text"
                    label="text"
                    icon={FolderClosedIcon}
                  >
                    <TreeNode
                      value="forms-inputs-text-validation"
                      label="validation"
                      icon={FolderClosedIcon}
                    >
                      <TreeNode
                        value="forms-inputs-text-validation-rules"
                        label="rules"
                        icon={FolderClosedIcon}
                      >
                        <TreeNode
                          value="forms-inputs-text-validation-rules-required"
                          label="required"
                          icon={DocumentIcon}
                        />
                        <TreeNode
                          value="forms-inputs-text-validation-rules-pattern"
                          label="pattern"
                          icon={DocumentIcon}
                        />
                        <TreeNode
                          value="forms-inputs-text-validation-rules-length"
                          label="length"
                          icon={DocumentIcon}
                        />
                      </TreeNode>
                    </TreeNode>
                  </TreeNode>
                  <TreeNode
                    value="forms-inputs-select"
                    label="select"
                    icon={DocumentIcon}
                  />
                  <TreeNode
                    value="forms-inputs-checkbox"
                    label="checkbox"
                    icon={DocumentIcon}
                  />
                </TreeNode>
              </TreeNode>
            </TreeNode>
            <TreeNode value="layout" label="layout" icon={FolderClosedIcon}>
              <TreeNode value="grid" label="grid" icon={DocumentIcon} />
              <TreeNode value="flex" label="flex" icon={DocumentIcon} />
            </TreeNode>
          </TreeNode>
          <TreeNode value="utils" label="utils" icon={FolderClosedIcon}>
            <TreeNode value="helpers" label="helpers" icon={FolderClosedIcon}>
              <TreeNode value="string" label="string" icon={DocumentIcon} />
              <TreeNode value="number" label="number" icon={DocumentIcon} />
              <TreeNode value="array" label="array" icon={DocumentIcon} />
            </TreeNode>
          </TreeNode>
        </TreeNode>
        <TreeNode value="tests" label="tests" icon={FolderClosedIcon}>
          <TreeNode value="unit" label="unit" icon={FolderClosedIcon}>
            <TreeNode
              value="unit-components"
              label="components"
              icon={FolderClosedIcon}
            >
              <TreeNode
                value="button-test"
                label="button.test"
                icon={DocumentIcon}
              />
              <TreeNode
                value="form-test"
                label="form.test"
                icon={DocumentIcon}
              />
            </TreeNode>
          </TreeNode>
          <TreeNode
            value="integration"
            label="integration"
            icon={DocumentIcon}
          />
        </TreeNode>
      </TreeNode>
      <TreeNode
        value="project-beta"
        label="Project Beta"
        icon={FolderClosedIcon}
      >
        <TreeNode value="api" label="api" icon={FolderClosedIcon}>
          <TreeNode value="endpoints" label="endpoints" icon={FolderClosedIcon}>
            <TreeNode value="users" label="users" icon={DocumentIcon} />
            <TreeNode value="posts" label="posts" icon={DocumentIcon} />
            <TreeNode value="comments" label="comments" icon={DocumentIcon} />
          </TreeNode>
        </TreeNode>
      </TreeNode>
      <TreeNode
        value="project-gamma"
        label="Project Gamma"
        icon={FolderClosedIcon}
      >
        <TreeNode
          value="documentation"
          label="documentation"
          icon={FolderClosedIcon}
        >
          <TreeNode value="readme" label="README.md" icon={DocumentIcon} />
          <TreeNode
            value="contributing"
            label="CONTRIBUTING.md"
            icon={DocumentIcon}
          />
        </TreeNode>
      </TreeNode>
    </TreeNode>
  </Tree>
);
DeepNesting.args = {
  multiselect: true,
};
