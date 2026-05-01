import {
  Button,
  FlexLayout,
  FormField,
  FormFieldLabel,
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
  SidePanelContent,
  SidePanelHeader,
  SidePanelProvider,
  SidePanelTitle,
  useSidePanel,
} from "@salt-ds/lab";
import { clsx } from "clsx";
import React, { type CSSProperties, useState } from "react";
import styles from "./WithTable.module.css";

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

const panelStyle = {
  "--saltSidePanel-width": "250px",
} as CSSProperties;

const SidePanelExample = () => {
  const [selectedRow, setSelectedRow] = useState<TeamMember | null>(null);
  const [data, setData] = useState(tableData);
  const [formValues, setFormValues] = useState<TeamMember | null>(null);
  const { CloseIcon } = useIcon();
  const { setOpen, openState, setTriggerRef, panelId } = useSidePanel();

  const titleId = useId();
  const closeButtonId = useId();

  const handleRowClick = (row: TeamMember, target: HTMLElement) => {
    if (openState && selectedRow?.id === row.id) {
      setOpen(false);
      return;
    }

    setTriggerRef(target);
    setSelectedRow(row);
    setFormValues({ ...row });
    setOpen(true);
  };

  const handleSave = () => {
    if (formValues) {
      setData((prev) =>
        prev.map((r) => (r.id === formValues.id ? formValues : r)),
      );
    }
    setOpen(false);
  };

  const getRowTriggerProps = (row: TeamMember) => {
    const isExpanded = openState && selectedRow?.id === row.id;

    return {
      "aria-expanded": isExpanded,
      "aria-controls": isExpanded ? panelId : undefined,
      "aria-label": `Edit details for ${row.name}`,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        handleRowClick(row, e.currentTarget);
      },
    };
  };

  return (
    <FlexLayout
      style={{
        width: "100%",
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
                <TH>Phone</TH>
                <TH>Action</TH>
              </TR>
            </THead>
            <TBody>
              {data.map((row) => (
                <TR key={row.id}>
                  <TD>{row.name}</TD>
                  <TD>{row.email}</TD>
                  <TD>{row.phone}</TD>
                  <TD>
                    <Button
                      {...getRowTriggerProps(row)}
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

      <SidePanel
        position="right"
        style={panelStyle}
        key={selectedRow?.id}
        disableAnimation
      >
        {formValues && (
          <>
            <SidePanelHeader>
              <SidePanelTitle id={titleId}>
                <span className={styles.visuallyHidden}>{formValues.name}</span>
                Employee Details
              </SidePanelTitle>
              <Button
                aria-label="Close"
                aria-labelledby={clsx(closeButtonId, titleId) || undefined}
                appearance="transparent"
                onClick={() => setOpen(false)}
              >
                <CloseIcon aria-hidden />
              </Button>
            </SidePanelHeader>
            <SidePanelContent>
              <StackLayout style={{ width: "100%" }}>
                <FormField>
                  <FormFieldLabel>Name</FormFieldLabel>
                  <Input
                    value={formValues.name}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setFormValues(
                        (v) => v && { ...v, name: event.target.value },
                      )
                    }
                  />
                </FormField>
                <FormField>
                  <FormFieldLabel>Email</FormFieldLabel>
                  <Input
                    value={formValues.email}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setFormValues(
                        (v) => v && { ...v, email: event.target.value },
                      )
                    }
                  />
                </FormField>
                <FormField>
                  <FormFieldLabel>Phone</FormFieldLabel>
                  <Input
                    value={formValues.phone}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setFormValues(
                        (v) => v && { ...v, phone: event.target.value },
                      )
                    }
                  />
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
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                </FlexLayout>
              </StackLayout>
            </SidePanelContent>
          </>
        )}
      </SidePanel>
    </FlexLayout>
  );
};

export const WithTable = () => (
  <SidePanelProvider>
    <SidePanelExample />
  </SidePanelProvider>
);
