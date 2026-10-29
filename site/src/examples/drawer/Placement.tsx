import {
  Button,
  Display2,
  Display3,
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  FlexLayout,
  FlowLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  H3,
  Input,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { AgGridReact } from "ag-grid-react";
import { type ReactElement, useState } from "react";
import { useAgGridHelpers } from "../ag-grid-theme/useAgGridHelpers";

const placeholderText =
  "This placeholder text is provided to illustrate how content will appear within the component. The sentences are intended for demonstration only and do not convey specific information. Generic examples like this help review layout, spacing, and overall design. Adjust the wording as needed to fit your use case or display requirements.";

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

const FormFieldExample = () => (
  <FormField>
    <FormFieldLabel>Label</FormFieldLabel>
    <Input />
    <FormFieldHelperText>Help text appears here</FormFieldHelperText>
  </FormField>
);

const SideContent = () => (
  <StackLayout>
    <Text>{placeholderText}</Text>
    {Array.from({ length: 7 }, (_, index) => (
      <FormFieldExample key={index} />
    ))}
  </StackLayout>
);

const TopContent = () => (
  <StackLayout>
    <Text>{placeholderText}</Text>
    <FlexLayout>
      {Array.from({ length: 4 }, (_, index) => (
        <FormFieldExample key={index} />
      ))}
    </FlexLayout>
  </StackLayout>
);

const BottomContent = () => {
  const { containerProps, agGridProps } = useAgGridHelpers();

  return (
    <StackLayout gap={3}>
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
      <FlowLayout gap={1}>
        <H3>Threshold Summary</H3>
        <Text>(Projected Revenue)</Text>
      </FlowLayout>
      <FlowLayout justify="space-between">
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
          <Text style={{ position: "absolute" }}>Blended bps</Text>
          <Display2>0.968</Display2>
        </StackLayout>
      </FlowLayout>
    </StackLayout>
  );
};

const LeftDrawer = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>left</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        position="left"
        style={{ width: 500 }}
      >
        <DrawerHeader
          header="Left drawer"
          actions={
            <Button
              aria-label="Close drawer"
              appearance="transparent"
              onClick={handleClose}
            >
              <CloseIcon aria-hidden />
            </Button>
          }
        />
        <DrawerContent>
          <SideContent />
        </DrawerContent>
        <DrawerFooter>
          <Button
            sentiment="accented"
            appearance="bordered"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button sentiment="accented" onClick={handleClose}>
            Save
          </Button>
        </DrawerFooter>
      </Drawer>
    </>
  );
};

const RightDrawer = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>right</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        position="right"
        style={{ width: 500 }}
      >
        <DrawerHeader
          header="Right drawer"
          actions={
            <Button
              aria-label="Close drawer"
              appearance="transparent"
              onClick={handleClose}
            >
              <CloseIcon aria-hidden />
            </Button>
          }
        />
        <DrawerContent>
          <SideContent />
        </DrawerContent>
        <DrawerFooter>
          <Button
            sentiment="accented"
            appearance="bordered"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button sentiment="accented" onClick={handleClose}>
            Save
          </Button>
        </DrawerFooter>
      </Drawer>
    </>
  );
};

const TopDrawer = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>top</Button>
      <Drawer open={open} onOpenChange={setOpen} position="top">
        <DrawerHeader
          header="Top drawer"
          actions={
            <Button
              aria-label="Close drawer"
              appearance="transparent"
              onClick={handleClose}
            >
              <CloseIcon aria-hidden />
            </Button>
          }
        />
        <DrawerContent>
          <TopContent />
        </DrawerContent>
        <DrawerFooter>
          <Button
            sentiment="accented"
            appearance="bordered"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button sentiment="accented" onClick={handleClose}>
            Save
          </Button>
        </DrawerFooter>
      </Drawer>
    </>
  );
};

const BottomDrawer = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>bottom</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        position="bottom"
        style={{ height: "max-content" }}
      >
        <DrawerHeader
          header="Marginal Tiering"
          actions={
            <Button
              aria-label="Close drawer"
              appearance="transparent"
              onClick={handleClose}
            >
              <CloseIcon aria-hidden />
            </Button>
          }
        />
        <DrawerContent>
          <BottomContent />
        </DrawerContent>
        <DrawerFooter>
          <Button
            sentiment="accented"
            appearance="bordered"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button sentiment="accented" onClick={handleClose}>
            Update Tier
          </Button>
        </DrawerFooter>
      </Drawer>
    </>
  );
};

export const Placement = (): ReactElement => (
  <StackLayout gap={1}>
    <LeftDrawer />
    <RightDrawer />
    <TopDrawer />
    <BottomDrawer />
  </StackLayout>
);
