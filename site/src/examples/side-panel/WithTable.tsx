import {
  Button,
  FlexLayout,
  H2,
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
import { CloseIcon } from "@salt-ds/icons";
import { SidePanel, SidePanelGroup, SidePanelTrigger } from "@salt-ds/lab";
import { useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  department: string;
  status: string;
}

const tableData: TeamMember[] = [
  {
    id: "1",
    name: "Alice Johnson",
    department: "Engineering",
    status: "Active",
  },
  {
    id: "2",
    name: "Bob Smith",
    department: "Design",
    status: "Active",
  },
  {
    id: "3",
    name: "Carol Williams",
    department: "Product",
    status: "On Leave",
  },
  {
    id: "4",
    name: "David Brown",
    department: "Sales",
    status: "Active",
  },
  {
    id: "5",
    name: "Eve Martinez",
    department: "Engineering",
    status: "Active",
  },
];

export const WithTable = () => {
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
          height: "100%",
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
          <TableContainer>
            <Table>
              <caption>Team Members</caption>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Department</TH>
                  <TH>Status</TH>
                  <TH>Action</TH>
                </TR>
              </THead>
              <TBody>
                {tableData.map((row) => (
                  <TR key={row.id}>
                    <TD>{row.name}</TD>
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

        <SidePanel position="right" aria-labelledby={panelHeadingId}>
          <StackLayout align="start" gap={3}>
            <Button
              appearance="transparent"
              aria-label="close employee details"
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto" }}
            >
              <CloseIcon aria-hidden />
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
