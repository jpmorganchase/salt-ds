import {
  BorderItem,
  BorderLayout,
  Button,
  FlexItem,
  FlexLayout,
  FlexLayoutProps,
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

export const Responsive = () => {
  const startItem = (
    <FlexLayout gap={1} direction={{ xs: "column", sm: "row" }}>
      <FlexItem>
        <Button variant="cta" style={{ width: "100%" }}>
          Save
        </Button>
      </FlexItem>
      <FlexItem>
        <Button style={{ width: "100%" }}>Cancel</Button>
      </FlexItem>
    </FlexLayout>
  );

  const endItem = (
    <FlexLayout gap={1} direction={{ xs: "column", sm: "row" }}>
      <FlexItem>
        <Button variant="secondary" style={{ width: "100%" }}>
          <ExportIcon />
          Export
        </Button>
      </FlexItem>
      <FlexItem>
        <Button variant="secondary" style={{ width: "100%" }}>
          <ImportIcon />
          Import
        </Button>
      </FlexItem>
    </FlexLayout>
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

  const direction: FlexLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  const startItem = <FlexLayout gap={1}>{secondary}</FlexLayout>;

  const endItem = (
    <FlexLayout gap={1}>
      {primary}
      {cta}
    </FlexLayout>
  );

  const columnStack = (
    <FlexLayout direction="column" gap={1} style={{ width: "100%" }}>
      {cta}
      {primary}
      {secondary}
    </FlexLayout>
  );

  return (
    <div style={{ width: "50vw" }}>
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

  const startItem = (
    <Button variant="secondary" onClick={handleClose}>
      Save as draft
    </Button>
  );

  const endItem = (
    <FlexLayout gap={1}>
      <FlexItem>
        <Button onClick={handleClose}>Cancel</Button>
      </FlexItem>
      <FlexItem>
        <Button variant="cta" onClick={handleClose}>
          Submit
        </Button>
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

const tallForm = (
  <FlowLayout style={{ width: "30vh" }}>
    {Array.from({ length: 6 }, (_, i) => i + 1).map((i) => (
      <FormField key={i}>
        <FormFieldLabel>Field label</FormFieldLabel>
        <Input variant="secondary" defaultValue="Value text" />
      </FormField>
    ))}
  </FlowLayout>
);

export const FixedPosition = () => {
  return (
    <div style={{ height: "20vh", overflow: "auto" }}>
      <BorderLayout>
        <BorderItem position="north">
          {tallForm}
        </BorderItem>
        <BorderItem position="south" sticky>
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
        </BorderItem>
      </BorderLayout>
    </div>
  );
};

export const InLinePosition = () => {
  return (
    <StackLayout>
      {tallForm}
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
