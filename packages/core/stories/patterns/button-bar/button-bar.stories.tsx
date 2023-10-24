import {
  Button,
  FlexItem,
  FlexLayout,
  FlexLayoutProps,
  SplitLayout,
  useResponsiveProp,
} from "@salt-ds/core";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@salt-ds/lab";
import { ExportIcon, ImportIcon } from "@salt-ds/icons";

import { Meta } from "@storybook/react";
import { ElementType } from "react";

export default {
  title: "Patterns/Button Bar",
} as Meta;

export const ButtonBar = () => {
  return (
    <div style={{ width: "75vw" }}>
      <FlexLayout justify="end" style={{ width: "100%" }} gap={1}>
        <FlexItem>
          <Button>Cancel</Button>
        </FlexItem>
        <FlexItem>
          <Button variant="cta">Save</Button>
        </FlexItem>
      </FlexLayout>
    </div>
  );
};

export const WithSecondary = () => {
  const startItem = (
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

  const endItem = (
    <FlexLayout gap={1}>
      <FlexItem>
        <Button>Cancel</Button>
      </FlexItem>
      <FlexItem>
        <Button variant="cta">Save</Button>
      </FlexItem>
    </FlexLayout>
  );

  return (
    <div style={{ width: "75vw" }}>
      <SplitLayout
        startItem={startItem}
        endItem={endItem}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export const FullPage = () => {
  const startItem = (
    <FlexLayout gap={1}>
      <FlexItem>
        <Button>Previous</Button>
      </FlexItem>
      <FlexItem>
        <Button variant="cta">Continue</Button>
      </FlexItem>
    </FlexLayout>
  );

  const endItem = (
    <FlexLayout gap={1}>
      <FlexItem>
        <Button variant="secondary">Upload file</Button>
      </FlexItem>
    </FlexLayout>
  );

  return (
    <div style={{ width: "75vw" }}>
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
        <Button variant="secondary">Delete</Button>
      </FlexItem>
    </FlexLayout>
  );

  const endItem = (
    <FlexLayout gap={1}>
      <FlexItem>
        <Button>Cancel</Button>
      </FlexItem>
      <FlexItem>
        <Button variant="cta">Save changes</Button>
      </FlexItem>
    </FlexLayout>
  );

  return (
    <div style={{ width: "75vw" }}>
      <SplitLayout
        startItem={startItem}
        endItem={endItem}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export const Stacked = () => {
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
    useResponsiveProp(
      { xs: "column", sm: "row", md: "row", lg: "row", xl: "row" },
      "row"
    );

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
    <div style={{ width: "75vw" }}>
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

export const InDialog = () => {
  return (
    <Dialog
      style={{
        width: 500,
      }}
      role="alertdialog"
    >
      <DialogTitle>Info</DialogTitle>
      <DialogContent>This is the content of the dialog.</DialogContent>
      <DialogActions>
        <Button>Cancel</Button>
        <Button variant="cta">Ok</Button>
      </DialogActions>
    </Dialog>
  );
};
