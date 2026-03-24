import {
  Button,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  H2,
  Input,
  StackLayout,
  Table,
  TableContainer,
  TBody,
  TD,
  Text,
  TH,
  THead,
  TR,
  useId,
} from "@salt-ds/core";
import { SidePanel, SidePanelGroup, SidePanelTrigger } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Lab/Side Panel",
  component: SidePanel,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof SidePanel>;

const FormFieldExample = () => (
  <FormField>
    <FormFieldLabel>Label</FormFieldLabel>
    <Input />
    <FormFieldHelperText>Help text appears here</FormFieldHelperText>
  </FormField>
);

export const Left: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const headingId = useId();

  return (
    <SidePanelGroup open={open} onOpenChange={setOpen}>
      <FlexLayout
        style={{
          height: "100vh",
        }}
        gap={0}
      >
        <SidePanel aria-labelledby={headingId} width={500}>
          <StackLayout align="start" gap={1}>
            <Button
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto" }}
            >
              Close
            </Button>
            <H2 id={headingId}>Section Title</H2>
            <Text>
              This placeholder text is provided to illustrate how content will
              appear within the component. The sentences are intended for
              demonstration only and do not convey specific information. Generic
              examples like this help review layout, spacing, and overall
              design. Adjust the wording as needed to fit your use case or
              display requirements.
            </Text>
            {Array.from({ length: 7 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
              <FormFieldExample key={index} />
            ))}
          </StackLayout>
        </SidePanel>
        <FlexLayout padding={1}>
          <SidePanelTrigger>
            <Button>Open Left Panel</Button>
          </SidePanelTrigger>
        </FlexLayout>
      </FlexLayout>
    </SidePanelGroup>
  );
};

export const Right: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const headingId = useId();

  return (
    <SidePanelGroup open={open} onOpenChange={setOpen}>
      <FlexLayout
        style={{
          height: "100vh",
        }}
      >
        <FlexItem grow={1} padding={1}>
          <SidePanelTrigger>
            <Button>Open Right Panel</Button>
          </SidePanelTrigger>
        </FlexItem>
        <SidePanel side="right" aria-labelledby={headingId} width={500}>
          <StackLayout align="start" gap={1}>
            <Button
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto" }}
            >
              Close
            </Button>
            <H2 id={headingId}>Section Title</H2>
            <Text>
              This placeholder text is provided to illustrate how content will
              appear within the component. The sentences are intended for
              demonstration only and do not convey specific information. Generic
              examples like this help review layout, spacing, and overall
              design. Adjust the wording as needed to fit your use case or
              display requirements.
            </Text>
            {Array.from({ length: 7 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
              <FormFieldExample key={index} />
            ))}
          </StackLayout>
        </SidePanel>
      </FlexLayout>
    </SidePanelGroup>
  );
};

export const Top: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const headingId = useId();

  return (
    <SidePanelGroup open={open} onOpenChange={setOpen}>
      <StackLayout gap={0}>
        <SidePanel side="top" aria-labelledby={headingId} height={300}>
          <StackLayout align="start">
            <Button
              onClick={() => setOpen(false)}
              style={{
                marginLeft: "auto",
              }}
            >
              Close
            </Button>
            <H2 id={headingId}>Section title</H2>
            <Text>
              This placeholder text is provided to illustrate how content will
              appear within the component. The sentences are intended for
              demonstration only and do not convey specific information. Generic
              examples like this help review layout, spacing, and overall
              design. Adjust the wording as needed to fit your use case or
              display requirements.
            </Text>
            <FlexLayout>
              {Array.from({ length: 4 }, (_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
                <FormFieldExample key={index} />
              ))}
            </FlexLayout>
          </StackLayout>
        </SidePanel>
        <FlexItem padding={1}>
          <SidePanelTrigger>
            <Button>Open top panel</Button>
          </SidePanelTrigger>
        </FlexItem>
      </StackLayout>
    </SidePanelGroup>
  );
};

export const Bottom: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const headingId = useId();

  return (
    <SidePanelGroup open={open} onOpenChange={setOpen}>
      <StackLayout
        style={{
          height: "100vh",
        }}
        gap={0}
      >
        <FlexItem grow={1} padding={1}>
          <SidePanelTrigger>
            <Button>Open bottom panel</Button>
          </SidePanelTrigger>
        </FlexItem>
        <SidePanel side="bottom" aria-labelledby={headingId} height={300}>
          <StackLayout align="start">
            <Button
              onClick={() => setOpen(false)}
              style={{
                marginLeft: "auto",
              }}
            >
              Close
            </Button>
            <H2 id={headingId}>Section title</H2>
            <Text>
              This placeholder text is provided to illustrate how content will
              appear within the component. The sentences are intended for
              demonstration only and do not convey specific information. Generic
              examples like this help review layout, spacing, and overall
              design. Adjust the wording as needed to fit your use case or
              display requirements.
            </Text>
            <FlexLayout>
              {Array.from({ length: 4 }, (_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
                <FormFieldExample key={index} />
              ))}
            </FlexLayout>
          </StackLayout>
        </SidePanel>
      </StackLayout>
    </SidePanelGroup>
  );
};

export const ManualTrigger: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const headingId = useId();

  return (
    <FlexLayout
      style={{
        height: "100vh",
      }}
      gap={0}
    >
      <SidePanel
        open={open}
        onOpenChange={setOpen}
        id={id}
        aria-labelledby={headingId}
      >
        <StackLayout align="start" gap={1}>
          <Button onClick={() => setOpen(false)} style={{ marginLeft: "auto" }}>
            Close
          </Button>
          <H2 id={headingId}>Manual Trigger Link</H2>
          <Text>
            This example shows a trigger outside SidePanelGroup. The user
            manually provides aria-expanded and aria-controls.
          </Text>
        </StackLayout>
      </SidePanel>
      <FlexLayout gap={1} padding={1}>
        <Button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={id}
        >
          Open Manual Panel
        </Button>
      </FlexLayout>
    </FlexLayout>
  );
};

export const Variants: StoryFn = () => {
  const [openPrimary, setOpenPrimary] = useState(false);
  const [openSecondary, setOpenSecondary] = useState(false);
  const [openTertiary, setOpenTertiary] = useState(false);
  const primaryHeadingId = useId();
  const secondaryHeadingId = useId();
  const tertiaryHeadingId = useId();

  return (
    <StackLayout gap={2} style={{ padding: "16px" }}>
      <FlexLayout gap={1}>
        <SidePanelGroup open={openPrimary} onOpenChange={setOpenPrimary}>
          <SidePanelTrigger>
            <Button>Toggle Primary Panel</Button>
          </SidePanelTrigger>
          <SidePanel
            variant="primary"
            side="left"
            aria-labelledby={primaryHeadingId}
          >
            <StackLayout align="start" gap={1}>
              <Button
                onClick={() => setOpenPrimary(false)}
                style={{ marginLeft: "auto" }}
              >
                Close
              </Button>
              <H2 id={primaryHeadingId}>Primary Variant</H2>
              <Text>
                This panel uses the primary variant, which is the default
                background color for containers.
              </Text>
              <FormFieldExample />
              <FormFieldExample />
            </StackLayout>
          </SidePanel>
        </SidePanelGroup>
        <SidePanelGroup open={openSecondary} onOpenChange={setOpenSecondary}>
          <SidePanelTrigger>
            <Button>Toggle Secondary Panel</Button>
          </SidePanelTrigger>
          <SidePanel
            variant="secondary"
            side="left"
            aria-labelledby={secondaryHeadingId}
          >
            <StackLayout align="start" gap={1}>
              <Button
                onClick={() => setOpenSecondary(false)}
                style={{ marginLeft: "auto" }}
              >
                Close
              </Button>
              <H2 id={secondaryHeadingId}>Secondary Variant</H2>
              <Text>
                This panel uses the secondary variant with a different
                background color.
              </Text>
              <FormFieldExample />
              <FormFieldExample />
            </StackLayout>
          </SidePanel>
        </SidePanelGroup>
        <SidePanelGroup open={openTertiary} onOpenChange={setOpenTertiary}>
          <SidePanelTrigger>
            <Button>Toggle Tertiary Panel</Button>
          </SidePanelTrigger>
          <SidePanel
            variant="tertiary"
            side="left"
            aria-labelledby={tertiaryHeadingId}
          >
            <StackLayout align="start" gap={1}>
              <Button
                onClick={() => setOpenTertiary(false)}
                style={{ marginLeft: "auto" }}
              >
                Close
              </Button>
              <H2 id={tertiaryHeadingId}>Tertiary Variant</H2>
              <Text>
                This panel uses the tertiary variant with yet another background
                color.
              </Text>
              <FormFieldExample />
              <FormFieldExample />
            </StackLayout>
          </SidePanel>
        </SidePanelGroup>
      </FlexLayout>
    </StackLayout>
  );
};

interface TeamMember {
  id: string;
  name: string;
  email: string;
  department: string;
  status: string;
}

const tableData: TeamMember[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    department: "Engineering",
    status: "Active",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    department: "Design",
    status: "Active",
  },
  {
    id: "3",
    name: "Carol Williams",
    email: "carol.williams@example.com",
    department: "Product",
    status: "On Leave",
  },
  {
    id: "4",
    name: "David Brown",
    email: "david.brown@example.com",
    department: "Sales",
    status: "Active",
  },
  {
    id: "5",
    name: "Eve Martinez",
    email: "eve.martinez@example.com",
    department: "Engineering",
    status: "Active",
  },
];

export const WithTable: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TeamMember | null>(null);
  const panelHeadingId = useId();

  const handleRowClick = (row: TeamMember) => {
    setSelectedRow(row);
    setOpen(true);
  };

  return (
    <SidePanelGroup open={open} onOpenChange={setOpen}>
      <FlexLayout
        style={{
          height: "100vh",
        }}
        gap={0}
      >
        <div
          style={{
            flex: 1,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <H2>Team Members</H2>
          <TableContainer style={{ marginTop: "16px", flex: 1 }}>
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Department</TH>
                  <TH>Status</TH>
                  <TH>Action</TH>
                </TR>
              </THead>
              <TBody>
                {tableData.map((row) => (
                  <TR key={row.id}>
                    <TD>{row.name}</TD>
                    <TD>{row.email}</TD>
                    <TD>{row.department}</TD>
                    <TD>{row.status}</TD>
                    <TD>
                      <SidePanelTrigger>
                        <Button
                          onClick={() => handleRowClick(row)}
                          style={{ minWidth: "auto" }}
                        >
                          View Details
                        </Button>
                      </SidePanelTrigger>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableContainer>
        </div>

        <SidePanel side="right" width={400} aria-labelledby={panelHeadingId}>
          <StackLayout align="start" gap={3}>
            <Button
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto" }}
            >
              Close
            </Button>
            {selectedRow && (
              <>
                <H2 id={panelHeadingId}>Employee Details</H2>
                <StackLayout gap={2}>
                  <div>
                    <Text style={{ fontWeight: 600 }}>Name</Text>
                    <Text>{selectedRow.name}</Text>
                  </div>
                  <div>
                    <Text style={{ fontWeight: 600 }}>Email</Text>
                    <Text>{selectedRow.email}</Text>
                  </div>
                  <div>
                    <Text style={{ fontWeight: 600 }}>Department</Text>
                    <Text>{selectedRow.department}</Text>
                  </div>
                  <div>
                    <Text style={{ fontWeight: 600 }}>Status</Text>
                    <Text>{selectedRow.status}</Text>
                  </div>
                  <Button>Edit Details</Button>
                </StackLayout>
              </>
            )}
          </StackLayout>
        </SidePanel>
      </FlexLayout>
    </SidePanelGroup>
  );
};
