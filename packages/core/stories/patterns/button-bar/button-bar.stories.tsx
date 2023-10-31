import {
  Button,
  FlexItem,
  FlexLayout,
  FlowLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  MultilineInput,
  SplitLayout,
  StackLayout,
} from "@salt-ds/core";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DropdownNext as Dropdown,
} from "@salt-ds/lab";
import { ExportIcon, ImportIcon } from "@salt-ds/icons";

import { Meta } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Patterns/Button Bar",
} as Meta;

export const ButtonBar = () => {
  return (
    <div style={{ width: "40vw" }}>
      <FlexLayout style={{ width: "100%" }} gap={1}>
        <FlexItem>
          <Button variant="cta">Save</Button>
        </FlexItem>
        <FlexItem>
          <Button>Cancel</Button>
        </FlexItem>
      </FlexLayout>
    </div>
  );
};

export const WithSecondary = () => {
  const startItem = (
    <FlexLayout gap={1}>
      <FlexItem>
        <Button variant="cta">Save</Button>
      </FlexItem>
      <FlexItem>
        <Button>Cancel</Button>
      </FlexItem>
    </FlexLayout>
  );

  const endItem = (
    <FlexLayout gap={1}>
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
    </FlexLayout>
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
    <FlexLayout gap={1}>
      <FlexItem>
        <Button variant="cta">Save changes</Button>
      </FlexItem>
      <FlexItem>
        <Button>Cancel</Button>
      </FlexItem>
    </FlexLayout>
  );

  const endItem = (
    <FlexLayout gap={1}>
      <FlexItem>
        <Button variant="secondary">Delete</Button>
      </FlexItem>
    </FlexLayout>
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
    <div style={{ width: "20vw" }}>
      <FlexLayout direction="column" gap={1} style={{ width: "100%" }}>
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
      </FlexLayout>
    </div>
  );
};

const formFields = (
  <FlowLayout style={{ width: "30vh" }}>
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
  </FlowLayout>
);

export const SingleStepForm = () => {
  return (
    <StackLayout>
      {formFields}
      <FlexLayout style={{ width: "100%" }} gap={1}>
        <FlexItem>
          <Button variant="cta">Submit</Button>
        </FlexItem>
        <FlexItem>
          <Button>Cancel</Button>
        </FlexItem>
      </FlexLayout>
    </StackLayout>
  );
};

export const MultiStepForm = () => {
  return (
    <StackLayout>
      {formFields}
      <FlexLayout justify="end" style={{ width: "100%" }} gap={1}>
        <FlexItem>
          <Button variant="secondary">Cancel</Button>
        </FlexItem>
        <FlexItem>
          <Button>Previous</Button>
        </FlexItem>
        <FlexItem>
          <Button variant="cta">Next</Button>
        </FlexItem>
      </FlexLayout>
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

  const startItem = <Button variant="secondary">Save as draft</Button>;

  const endItem = (
    <FlexLayout gap={1}>
      <FlexItem>
        <Button>Cancel</Button>
      </FlexItem>
      <FlexItem>
        <Button variant="cta">Submit</Button>
      </FlexItem>
    </FlexLayout>
  );

  return (
    <>
      <Button onClick={handleRequestOpen}>Open default dialog</Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
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

export const SmallViewport = () => {
  return (
    <StackLayout>
      {formFields}
      <FlexLayout gap={1} style={{ width: "100%" }}>
        <FlexItem basis="50%">
          <Button variant="cta" style={{ width: "100%" }}>
            Submit
          </Button>
        </FlexItem>
        <FlexItem basis="50%">
          <Button style={{ width: "100%" }}>Cancel</Button>
        </FlexItem>
      </FlexLayout>
    </StackLayout>
  );
};

export const FixedPosition = () => {
  return (
    <StackLayout>
      <div style={{ height: "15vh", overflow: "scroll" }}>{formFields}</div>
      <FlexLayout direction="column" gap={1} style={{ width: "100%" }}>
        <FlexItem>
          <Button variant="cta" style={{ width: "100%" }}>
            Submit
          </Button>
        </FlexItem>
        <FlexItem>
          <Button style={{ width: "100%" }}>Cancel</Button>
        </FlexItem>
      </FlexLayout>
    </StackLayout>
  );
};

export const InLinePosition = () => {
  return (
    <StackLayout>
      {formFields}
      <FlexLayout direction="column" gap={1} style={{ width: "100%" }}>
        <FlexItem>
          <Button variant="cta" style={{ width: "100%" }}>
            Submit
          </Button>
        </FlexItem>
        <FlexItem>
          <Button style={{ width: "100%" }}>Cancel</Button>
        </FlexItem>
      </FlexLayout>
    </StackLayout>
  );
};
