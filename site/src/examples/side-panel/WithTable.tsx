import {
  Button,
  FlexLayout,
  FormField,
  FormFieldLabel,
  H2,
  Input,
  StackLayout,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
  useIcon,
  useId,
} from "@salt-ds/core";
import {
  SidePanel,
  SidePanelProvider,
  useSidePanelContext,
} from "@salt-ds/lab";
import type React from "react";
import { useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const tableData: TeamMember[] = [
  {
    id: "1",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+1 212 555 0101",
  },
  {
    id: "2",
    name: "Taylor Reed",
    email: "taylor.reed@example.com",
    phone: "+1 212 555 0102",
  },
  {
    id: "3",
    name: "Jordan Lee",
    email: "jordan.lee@example.com",
    phone: "+1 212 555 0103",
  },
  {
    id: "4",
    name: "Casey Patel",
    email: "casey.patel@example.com",
    phone: "+1 212 555 0104",
  },
  {
    id: "5",
    name: "Riley Chen",
    email: "riley.chen@example.com",
    phone: "+1 212 555 0105",
  },
];

const SidePanelExample = () => {
  const [selectedRow, setSelectedRow] = useState<TeamMember | null>(null);
  const panelHeadingId = useId();
  const { CloseIcon } = useIcon();
  const { setOpen, setReference, getReferenceProps, panelId } =
    useSidePanelContext();

  const handleRowClick = (row: TeamMember, target: HTMLElement) => {
    setSelectedRow(row);
    setReference(target);
    setOpen(true);
  };

  const getTriggerProps = (row: TeamMember) =>
    getReferenceProps({
      "aria-controls": panelId,
      "aria-label": `Edit details for ${row.name}`,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        handleRowClick(row, e.currentTarget);
      },
    }) as Record<string, unknown>;

  return (
    <FlexLayout
      style={{
        width: "100%",
        minHeight: 450,
        height: "100%",
        border:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
      }}
      gap={0}
    >
      <div style={{ flex: 1, minWidth: 0, padding: "var(--salt-spacing-300)" }}>
        <TableContainer>
          <Table>
            <caption>Users</caption>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Email</TH>
                <TH>Action</TH>
              </TR>
            </THead>
            <TBody>
              {tableData.map((row) => (
                <TR key={row.id}>
                  <TD>{row.name}</TD>
                  <TD>{row.email}</TD>
                  <TD>
                    <Button
                      {...getTriggerProps(row)}
                      style={{ minWidth: "auto" }}
                    >
                      Edit
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      </div>

      <SidePanel position="right" aria-labelledby={panelHeadingId}>
        <StackLayout align="start" gap={3}>
          <Button
            style={{ marginLeft: "auto" }}
            aria-label="Close"
            appearance="transparent"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden />
          </Button>
          {selectedRow && (
            <StackLayout key={selectedRow.id} style={{ width: "100%" }}>
              <H2 id={panelHeadingId}>Employee Details</H2>
              <FormField>
                <FormFieldLabel>Name</FormFieldLabel>
                <Input defaultValue={selectedRow.name} />
              </FormField>
              <FormField>
                <FormFieldLabel>Email</FormFieldLabel>
                <Input defaultValue={selectedRow.email} />
              </FormField>
              <FormField>
                <FormFieldLabel>Phone</FormFieldLabel>
                <Input defaultValue={selectedRow.phone} />
              </FormField>
              <FlexLayout gap={1}>
                <Button
                  sentiment="accented"
                  appearance="bordered"
                  style={{ width: "100%" }}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  sentiment="accented"
                  style={{ width: "100%" }}
                  onClick={() => setOpen(false)}
                >
                  Save
                </Button>
              </FlexLayout>
            </StackLayout>
          )}
        </StackLayout>
      </SidePanel>
    </FlexLayout>
  );
};

export const WithTable = () => (
  <SidePanelProvider>
    <SidePanelExample />
  </SidePanelProvider>
);
