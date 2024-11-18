import {
  Button,
  Display2,
  Display3,
  Drawer,
  DrawerCloseButton,
  FlowLayout,
  H2,
  H3,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import { AgGridReact } from "ag-grid-react";
import { type ReactElement, useState } from "react";
import { useAgGridHelpers } from "../ag-grid-theme/useAgGridHelpers";

const columns = [
  {
    headerName: "Market Type",
    field: "market",
    suppressHeaderMenuButton: true,
    width: 120,
  },
  {
    headerName: "AUC",
    field: "auc",
    type: "rightAligned",
    suppressHeaderMenuButton: true,
    width: 120,
  },
  {
    headerName: "Price 1",
    field: "price1",
    type: "rightAligned",
    suppressHeaderMenuButton: true,
    width: 120,
    editable: true,
    cellClass: ["editable-cell", "numeric-cell"],
  },
  {
    headerName: "Threshold 1",
    field: "threshold1",
    type: "rightAligned",
    suppressHeaderMenuButton: true,
    width: 120,
    editable: true,
    cellClass: ["editable-cell", "numeric-cell"],
  },
  {
    headerName: "Price 2",
    field: "price2",
    type: "rightAligned",
    suppressHeaderMenuButton: true,
    width: 120,
    editable: true,
    cellClass: ["editable-cell", "numeric-cell"],
  },
  {
    headerName: "Threshold 2",
    field: "threshold2",
    type: "rightAligned",
    suppressHeaderMenuButton: true,
    width: 120,
    editable: true,
    cellClass: ["editable-cell", "numeric-cell"],
  },
  {
    headerName: "Price 3",
    field: "price3",
    type: "rightAligned",
    suppressHeaderMenuButton: true,
    width: 120,
    editable: true,
    cellClass: ["editable-cell", "numeric-cell"],
  },
  {
    headerName: "Threshold 3",
    field: "threshold3",
    type: "rightAligned",
    suppressHeaderMenuButton: true,
    width: 120,
    editable: true,
    cellClass: ["editable-cell", "numeric-cell"],
  },
  {
    headerName: "Price 4",
    field: "price4",
    type: "rightAligned",
    suppressHeaderMenuButton: true,
    width: 120,
    editable: true,
    cellClass: ["editable-cell", "numeric-cell"],
  },
  {
    headerName: "Threshold 4",
    field: "threshold4",
    type: "rightAligned",
    suppressHeaderMenuButton: true,
    width: 120,
    editable: true,
    cellClass: ["editable-cell", "numeric-cell"],
  },
];

const defaultData = [
  {
    market: "Australia",
    auc: "$15,000,000,000",
    price1: "1",
    threshold1: "$10,000mm",
    price2: "0.90",
    threshold2: "$20,000mm",
    price3: "0.75",
    threshold3: "$20,000mm",
    price4: "0.65",
    threshold4: "$30,000mm",
  },
];

export const BottomDrawer = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const { containerProps, agGridProps } = useAgGridHelpers();
  const id = useId();

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Bottom Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        position="bottom"
        style={{ height: "max-content" }}
        aria-labelledby={id}
      >
        <DrawerCloseButton onClick={handleClose} />
        <H2 id={id} style={{ paddingBottom: "var(--salt-spacing-300)" }}>
          Marginal Tiering
        </H2>
        <div
          {...containerProps}
          style={{ height: "calc(3 * var(--salt-size-base))" }}
        >
          <AgGridReact
            columnDefs={columns}
            rowData={defaultData}
            {...agGridProps}
          />
        </div>
        <FlowLayout justify="space-between">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "var(--salt-spacing-300) 0",
            }}
          >
            <H3
              style={{
                paddingRight: "var(--salt-spacing-100)",
              }}
            >
              Threshold Summary
            </H3>
            <Text>(Projected Revenue)</Text>
          </div>
        </FlowLayout>
        <Text
          style={{
            paddingRight: "calc(var(--salt-size-base) - var(--salt-size-bar))",
            margin: "calc(-1 * var(--salt-size-base)) 0",
            lineHeight: "var(--salt-spacing-300)",
            textAlign: "end",
          }}
        >
          Blended bps
        </Text>
        <FlowLayout
          justify="space-between"
          style={{
            padding: "var(--salt-spacing-300) 0",
          }}
        >
          <StackLayout direction="row" gap={3}>
            <StackLayout gap={0}>
              <Text>Below Threshold 1</Text>
              <Display3>$1,000,000</Display3>
            </StackLayout>
            <StackLayout gap={0}>
              <Text>Below Threshold 1 & 2</Text>
              <Display3>$450,000</Display3>
            </StackLayout>
            <StackLayout gap={0}>
              <Text>Below Threshold 2 & 3</Text>
              <Display3>$0</Display3>
            </StackLayout>
            <StackLayout gap={0}>
              <Text>Below Threshold 3 & 4</Text>
              <Display3>$0</Display3>
            </StackLayout>
            <StackLayout gap={0}>
              <Text>Total</Text>
              <Display3>$1,450,000</Display3>
            </StackLayout>
          </StackLayout>
          <StackLayout gap={0}>
            <Display2>0.968</Display2>
          </StackLayout>
        </FlowLayout>
        <FlowLayout justify="end">
          <Button appearance="transparent" onClick={handleClose}>
            Cancel
          </Button>
          <Button sentiment="accented" onClick={handleClose}>
            Update Tier
          </Button>
        </FlowLayout>
      </Drawer>
    </>
  );
};
