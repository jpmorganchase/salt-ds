import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Dropdown,
  FlexItem,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  MultilineInput,
  Option,
  SplitLayout,
  StackLayout,
  type StackLayoutProps,
  useResponsiveProp,
} from "@salt-ds/core";
import { ExportIcon, ImportIcon } from "@salt-ds/icons";

import type { Meta } from "@storybook/react-vite";
import { type ElementType, useState } from "react";

export default {
  title: "Patterns/Button Bar",
} as Meta;

export const ButtonBar = () => {
  return (
    <div style={{ width: "40vw" }}>
      <StackLayout
        direction={{ xs: "column", sm: "row" }}
        style={{ width: "100%" }}
        gap={1}
      >
        <FlexItem>
          <Button sentiment="accented" style={{ width: "100%" }}>
            Save
          </Button>
        </FlexItem>
        <FlexItem>
          <Button appearance="bordered" style={{ width: "100%" }}>
            Cancel
          </Button>
        </FlexItem>
      </StackLayout>
    </div>
  );
};

export const WithSecondary = () => {
  const startItem = (
    <StackLayout direction={{ xs: "column", sm: "row" }} gap={1}>
      <FlexItem>
        <Button sentiment="accented" style={{ width: "100%" }}>
          Save
        </Button>
      </FlexItem>
      <FlexItem>
        <Button appearance="bordered" style={{ width: "100%" }}>
          Cancel
        </Button>
      </FlexItem>
    </StackLayout>
  );

  const endItem = (
    <StackLayout direction={{ xs: "column", sm: "row" }} gap={1}>
      <FlexItem>
        <Button appearance="transparent" style={{ width: "100%" }}>
          <ExportIcon />
          Export
        </Button>
      </FlexItem>
      <FlexItem>
        <Button appearance="transparent" style={{ width: "100%" }}>
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
        gap={1}
        direction={{ xs: "column", sm: "row" }}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export const DestructiveActions = () => {
  const startItem = (
    <StackLayout direction={{ xs: "column", sm: "row" }} gap={1}>
      <FlexItem>
        <Button sentiment="accented" style={{ width: "100%" }}>
          Save
        </Button>
      </FlexItem>
      <FlexItem>
        <Button appearance="bordered" style={{ width: "100%" }}>
          Cancel
        </Button>
      </FlexItem>
    </StackLayout>
  );

  const endItem = (
    <StackLayout direction={{ xs: "column", sm: "row" }} gap={1}>
      <FlexItem>
        <Button appearance="transparent" style={{ width: "100%" }}>
          Delete
        </Button>
      </FlexItem>
    </StackLayout>
  );

  return (
    <div style={{ width: "40vw" }}>
      <SplitLayout
        startItem={startItem}
        endItem={endItem}
        direction={{ xs: "column", sm: "row" }}
        gap={1}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export const Responsive = () => {
  const startItem = (
    <StackLayout gap={1} direction={{ xs: "column", sm: "row" }}>
      <FlexItem>
        <Button sentiment="accented" style={{ width: "100%" }}>
          Save
        </Button>
      </FlexItem>
      <FlexItem>
        <Button appearance="bordered" style={{ width: "100%" }}>
          Cancel
        </Button>
      </FlexItem>
    </StackLayout>
  );

  const endItem = (
    <StackLayout gap={1} direction={{ xs: "column", sm: "row" }}>
      <FlexItem>
        <Button appearance="transparent" style={{ width: "100%" }}>
          <ExportIcon />
          Export
        </Button>
      </FlexItem>
      <FlexItem>
        <Button appearance="transparent" style={{ width: "100%" }}>
          <ImportIcon />
          Import
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
  const bordered = (
    <FlexItem>
      <Button appearance="bordered" style={{ width: "100%" }}>
        Cancel
      </Button>
    </FlexItem>
  );

  const transparent = (
    <FlexItem>
      <Button appearance="transparent" style={{ width: "100%" }}>
        Delete
      </Button>
    </FlexItem>
  );

  const accented = (
    <FlexItem>
      <Button sentiment="accented" style={{ width: "100%" }}>
        Save
      </Button>
    </FlexItem>
  );

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  const startItem = <StackLayout gap={1}>{transparent}</StackLayout>;

  const endItem = (
    <StackLayout direction={"row"} gap={1}>
      {bordered}
      {accented}
    </StackLayout>
  );

  const columnStack = (
    <StackLayout direction="column" gap={1} style={{ width: "100%" }}>
      {accented}
      {bordered}
      {transparent}
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
      <Dropdown defaultSelected={["Value"]} style={{ width: "100%" }}>
        <Option value="Value">Value</Option>
      </Dropdown>
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
      <StackLayout
        direction={{ xs: "column", sm: "row" }}
        style={{ width: "100%" }}
        gap={1}
      >
        <FlexItem>
          <Button sentiment="accented" style={{ width: "100%" }}>
            Submit
          </Button>
        </FlexItem>
        <FlexItem>
          <Button appearance="bordered" style={{ width: "100%" }}>
            Cancel
          </Button>
        </FlexItem>
      </StackLayout>
    </StackLayout>
  );
};

export const MultiStepForm = () => {
  const previous = (
    <FlexItem>
      <Button appearance="bordered" style={{ width: "100%" }}>
        Previous
      </Button>
    </FlexItem>
  );

  const cancel = (
    <FlexItem>
      <Button appearance="transparent" style={{ width: "100%" }}>
        Cancel
      </Button>
    </FlexItem>
  );

  const next = (
    <FlexItem>
      <Button sentiment="accented" style={{ width: "100%" }}>
        Next
      </Button>
    </FlexItem>
  );

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  return (
    <StackLayout style={{ width: "330px" }}>
      {formFields}
      {direction === "column" ? (
        <StackLayout direction={"column"} style={{ width: "100%" }} gap={1}>
          {next}
          {previous}
          {cancel}
        </StackLayout>
      ) : (
        <FlexItem align={"end"}>
          <StackLayout direction={"row"} style={{ width: "100%" }} gap={1}>
            {cancel}
            {previous}
            {next}
          </StackLayout>
        </FlexItem>
      )}
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

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  const save = (
    <FlexItem>
      <Button
        variant="secondary"
        onClick={handleClose}
        style={{ width: "100%" }}
      >
        Save as draft
      </Button>
    </FlexItem>
  );
  const cancel = (
    <FlexItem>
      <Button
        appearance="bordered"
        onClick={handleClose}
        style={{ width: "100%" }}
      >
        Cancel
      </Button>
    </FlexItem>
  );

  const submit = (
    <FlexItem>
      <Button
        sentiment="accented"
        onClick={handleClose}
        style={{ width: "100%" }}
      >
        Submit
      </Button>
    </FlexItem>
  );

  const endItem = (
    <StackLayout direction={{ xs: "column", sm: "row" }} gap={1}>
      {cancel}
      {submit}
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
          {direction === "column" ? (
            <StackLayout gap={1} style={{ width: "100%" }}>
              {submit}
              {cancel}
              {save}
            </StackLayout>
          ) : (
            <SplitLayout
              direction={"row"}
              startItem={save}
              endItem={endItem}
              style={{ width: "100%" }}
            />
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
