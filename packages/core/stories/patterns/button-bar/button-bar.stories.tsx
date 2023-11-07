import {
  BorderItem,
  BorderLayout,
  Button,
  FlexItem,
  StackLayoutProps,
  FlowLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  Label,
  MultilineInput,
  Panel,
  SplitLayout,
  StackLayout,
  useResponsiveProp,
} from "@salt-ds/core";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DropdownNext as Dropdown,
} from "@salt-ds/lab";
import { ExportIcon, ImportIcon } from "@salt-ds/icons";

import { Meta } from "@storybook/react";
import { ElementType, useState } from "react";

export default {
  title: "Patterns/Button Bar",
} as Meta;

export const ButtonBar = () => {
  return (
    <div style={{ width: "40vw" }}>
      <StackLayout direction={"row"} style={{ width: "100%" }} gap={1}>
        <FlexItem>
          <Button variant="cta">Save</Button>
        </FlexItem>
        <FlexItem>
          <Button>Cancel</Button>
        </FlexItem>
      </StackLayout>
    </div>
  );
};

export const WithSecondary = () => {
  const startItem = (
    <StackLayout direction={"row"} gap={1}>
      <FlexItem>
        <Button variant="cta">Save</Button>
      </FlexItem>
      <FlexItem>
        <Button>Cancel</Button>
      </FlexItem>
    </StackLayout>
  );

  const endItem = (
    <StackLayout direction={"row"} gap={1}>
      <FlexItem>
        <Button variant="secondary">
          <ExportIcon />
          Export
        </Button>
      </FlexItem>
      <FlexItem>
        <Button variant="secondary">
          <ImportIcon />
          Import
        </Button>
      </FlexItem>
    </StackLayout>
  );

  return (
    <div style={{ width: "40vw" }}>
      <SplitLayout
        startItem={startItem}
        endItem={endItem}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export const DestructiveActions = () => {
  const startItem = (
    <StackLayout direction={"row"} gap={1}>
      <FlexItem>
        <Button variant="cta">Save</Button>
      </FlexItem>
      <FlexItem>
        <Button>Cancel</Button>
      </FlexItem>
    </StackLayout>
  );

  const endItem = (
    <StackLayout direction={"row"} gap={1}>
      <FlexItem>
        <Button variant="secondary">Delete</Button>
      </FlexItem>
    </StackLayout>
  );

  return (
    <div style={{ width: "40vw" }}>
      <SplitLayout
        startItem={startItem}
        endItem={endItem}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export const Stacked = () => {
  return (
    <div style={{ width: "200px" }}>
      <StackLayout direction="column" gap={1} style={{ width: "100%" }}>
        <FlexItem>
          <Button variant="cta" style={{ width: "100%" }}>
            CTA
          </Button>
        </FlexItem>
        <FlexItem>
          <Button style={{ width: "100%" }}>Primary</Button>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" style={{ width: "100%" }}>
            Secondary
          </Button>
        </FlexItem>
      </StackLayout>
    </div>
  );
};

export const Responsive = () => {
  const startItem = (
    <StackLayout gap={1} direction={{ xs: "column", sm: "row" }}>
      <FlexItem>
        <Button variant="cta" style={{ width: "100%" }}>
          CTA
        </Button>
      </FlexItem>
      <FlexItem>
        <Button style={{ width: "100%" }}>Primary</Button>
      </FlexItem>
    </StackLayout>
  );

  const endItem = (
    <StackLayout gap={1} direction={{ xs: "column", sm: "row" }}>
      <FlexItem>
        <Button variant="secondary" style={{ width: "100%" }}>
          Secondary
        </Button>
      </FlexItem>
    </StackLayout>
  );

  return (
    <div style={{ width: "40vw" }}>
      <SplitLayout
        gap={1}
        startItem={startItem}
        endItem={endItem}
        direction={{ xs: "column", sm: "row" }}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export const ResponsiveReverse = () => {
  const primary = (
    <FlexItem>
      <Button style={{ width: "100%" }}>Primary</Button>
    </FlexItem>
  );

  const secondary = (
    <FlexItem>
      <Button variant="secondary" style={{ width: "100%" }}>
        Secondary
      </Button>
    </FlexItem>
  );

  const cta = (
    <FlexItem>
      <Button variant="cta" style={{ width: "100%" }}>
        CTA
      </Button>
    </FlexItem>
  );

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  const startItem = <StackLayout gap={1}>{secondary}</StackLayout>;

  const endItem = (
    <StackLayout direction={"row"} gap={1}>
      {primary}
      {cta}
    </StackLayout>
  );

  const columnStack = (
    <StackLayout direction="column" gap={1} style={{ width: "100%" }}>
      {cta}
      {primary}
      {secondary}
    </StackLayout>
  );

  return (
    <div style={{ width: "40vw" }}>
      {direction === "column" ? (
        columnStack
      ) : (
        <SplitLayout
          startItem={startItem}
          endItem={endItem}
          style={{ width: "100%" }}
          gap={1}
          direction={direction}
        />
      )}
    </div>
  );
};

const formFields = (
  <>
    <FormField>
      <FormFieldLabel>Field label</FormFieldLabel>
      <Input defaultValue="Value text" />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Field label</FormFieldLabel>
      <Dropdown
        source={["Value"]}
        defaultSelected="Value"
        style={{ width: "100%" }}
      />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Field label</FormFieldLabel>
      <MultilineInput bordered defaultValue="Value text" />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
  </>
);

export const SingleStepForm = () => {
  return (
    <StackLayout style={{ width: "330px" }}>
      {formFields}
      <StackLayout direction={"row"} style={{ width: "100%" }} gap={1}>
        <FlexItem>
          <Button variant="cta">Submit</Button>
        </FlexItem>
        <FlexItem>
          <Button>Cancel</Button>
        </FlexItem>
      </StackLayout>
    </StackLayout>
  );
};

export const MultiStepForm = () => {
  return (
    <StackLayout style={{ width: "330px" }}>
      {formFields}
      <FlexItem align={"end"}>
        <StackLayout direction={"row"} style={{ width: "100%" }} gap={1}>
          <FlexItem>
            <Button variant="secondary">Cancel</Button>
          </FlexItem>
          <FlexItem>
            <Button>Previous</Button>
          </FlexItem>
          <FlexItem>
            <Button variant="cta">Next</Button>
          </FlexItem>
        </StackLayout>
      </FlexItem>
    </StackLayout>
  );
};

export const DialogForm = () => {
  const [open, setOpen] = useState(false);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const startItem = (
    <Button variant="secondary" onClick={handleClose}>
      Save
    </Button>
  );

  const endItem = (
    <StackLayout direction={"row"} gap={1}>
      <FlexItem>
        <Button onClick={handleClose}>Cancel</Button>
      </FlexItem>
      <FlexItem>
        <Button variant="cta" onClick={handleClose}>
          Submit
        </Button>
      </FlexItem>
    </StackLayout>
  );

  return (
    <>
      <Button onClick={handleRequestOpen}>Open default dialog</Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        style={{ width: "378px" }}
      >
        <DialogContent>{formFields}</DialogContent>
        <DialogActions>
          <SplitLayout
            startItem={startItem}
            endItem={endItem}
            style={{ width: "100%" }}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};
