import {
  Button,
  FlexItem,
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
  useId,
} from "@salt-ds/core";
import {
  SidePanel,
  SidePanelCloseButton,
  SidePanelGroup,
  SidePanelTrigger,
} from "@salt-ds/lab";
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

export const WithTable = () => {
  const [selectedRow, setSelectedRow] = useState<TeamMember | null>(null);
  const panelHeadingId = useId();

  const handleRowClick = (row: TeamMember) => {
    setSelectedRow(row);
  };

  return (
    <SidePanelGroup>
      <FlexLayout
        style={{
          minHeight: 450,
          height: "100%",
          border:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
        }}
        gap={0}
        align="center"
      >
        <FlexItem basis={1} padding={3}>
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
                      <SidePanelTrigger>
                        <Button
                          onClick={() => handleRowClick(row)}
                          style={{ minWidth: "auto" }}
                          aria-label={`Edit details for ${row.name}`}
                        >
                          Edit
                        </Button>
                      </SidePanelTrigger>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableContainer>
        </FlexItem>

        <SidePanel position="right" aria-labelledby={panelHeadingId}>
          <StackLayout align="start" gap={3}>
            <SidePanelCloseButton aria-labelledby={panelHeadingId} />
            {selectedRow && (
              <StackLayout style={{ width: "100%" }}>
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
                  >
                    Cancel
                  </Button>
                  <Button sentiment="accented" style={{ width: "100%" }}>
                    Save
                  </Button>
                </FlexLayout>
              </StackLayout>
            )}
          </StackLayout>
        </SidePanel>
      </FlexLayout>
    </SidePanelGroup>
  );
};
