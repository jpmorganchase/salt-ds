import {
  Button,
  Dialog,
  DialogActions,
  DialogCloseButton,
  DialogContent,
  DialogHeader,
  type DialogProps,
  FlowLayout,
  VALIDATION_NAMED_STATUS,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

import "./dialog.stories.css";
import { Fragment } from "react";

export default {
  title: "Core/Dialog/QA",
  component: Dialog,
} as Meta<typeof Dialog>;

const DialogTemplate: StoryFn<DialogProps & { header: string }> = ({
  open: openProp = true,
  status,
  header,
}) => {
  return (
    <Dialog status={status} open={openProp}>
      <DialogHeader header={header} />
      <DialogContent>This is dialog content...</DialogContent>
      <DialogActions>
        <Button style={{ marginRight: "auto" }} appearance="transparent">
          Cancel
        </Button>
        <Button>Previous</Button>
        <Button sentiment="accented" appearance="transparent">
          Next
        </Button>
      </DialogActions>
      <DialogCloseButton />
    </Dialog>
  );
};

export const StatusVariants: StoryFn<QAContainerProps> = () => {
  const DensityValues = ["high", "medium", "low", "touch"] as const;
  return (
    <FlowLayout gap={0}>
      {DensityValues.map((density) => (
        <Fragment key={density}>
          <iframe
            src={`/iframe.html?globals=density:${density}&args=open:!true&id=core-dialog--default&viewMode=story`}
            style={{ all: "unset", width: 1200, height: 320 }}
          />
          <iframe
            src={`/iframe.html?globals=mode:dark;density:${density}&args=open:!true&id=core-dialog--default&viewMode=story`}
            style={{ all: "unset", width: 1200, height: 320 }}
          />
          {VALIDATION_NAMED_STATUS.map((status) => (
            <Fragment key={status}>
              <iframe
                src={`/iframe.html?globals=density:${density}&args=open:!true;status:${status}&id=core-dialog--default&viewMode=story`}
                style={{ all: "unset", width: 1200, height: 320 }}
              />
              <iframe
                src={`/iframe.html?globals=mode:dark;density:${density}&args=open:!true;status:${status}&id=core-dialog--default&viewMode=story`}
                style={{ all: "unset", width: 1200, height: 320 }}
              />
            </Fragment>
          ))}
        </Fragment>
      ))}
    </FlowLayout>
  );
};

StatusVariants.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};

export const ContentVariants: StoryFn<QAContainerProps> = () => {
  const DensityValues = ["high", "medium", "low", "touch"] as const;
  const DialogSizes = ["small", "medium", "large"] as const;
  return (
    <FlowLayout gap={0}>
      {DensityValues.map((density) => (
        <Fragment key={density}>
          {DialogSizes.map((size) => (
            <FlowLayout key={size}>
              <iframe
                src={`/iframe.html?globals=density:${density}&args=open:!true&id=core-dialog--default&viewMode=story`}
                style={{ all: "unset", width: 350, height: 320 }}
              />
              <iframe
                src={`/iframe.html?globals=density:${density}&args=open:!true&id=core-dialog--default&viewMode=story`}
                style={{ all: "unset", width: 700, height: 320 }}
              />
              <iframe
                src={`/iframe.html?globals=density:${density}&args=open:!true&id=core-dialog--default&viewMode=story`}
                style={{ all: "unset", width: 1200, height: 320 }}
              />
            </FlowLayout>
          ))}
          <iframe
            src={`/iframe.html?globals=density:${density}&args=open:!true&id=core-dialog--sticky-footer&viewMode=story`}
            style={{ all: "unset", width: 1200, height: 320 }}
          />
          <iframe
            src={`/iframe.html?globals=mode:dark;density:${density}&args=open:!true&id=core-dialog--sticky-footer&viewMode=story`}
            style={{ all: "unset", width: 1200, height: 320 }}
          />
          <iframe
            src={`/iframe.html?globals=density:${density}&args=open:!true&id=core-dialog--long-content&viewMode=story`}
            style={{ all: "unset", width: 1200, height: 320 }}
          />
          <iframe
            src={`/iframe.html?globals=mode:dark;density:${density}&args=open:!true&id=core-dialog--long-content&viewMode=story`}
            style={{ all: "unset", width: 1200, height: 320 }}
          />
        </Fragment>
      ))}
    </FlowLayout>
  );
};

ContentVariants.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};

export const DialogHeaders: StoryFn<QAContainerProps> = () => (
  <QAContainer
    height={600}
    cols={1}
    itemPadding={5}
    width={1200}
    // vertical
    // transposeDensity
  >
    <DialogHeader
      header="Terms and conditions"
      style={{
        width: 600,
      }}
    />
    <DialogHeader
      style={{
        width: 600,
      }}
      header="Terms and conditions"
      preheader="Ensure you read and agree to these Terms"
    />
    <DialogHeader
      status="info"
      header="Terms and conditions"
      style={{
        width: 600,
      }}
    />
    <DialogHeader
      status="info"
      style={{
        width: 600,
      }}
      header="Terms and conditions"
      preheader="Ensure you read and agree to these Terms"
    />
  </QAContainer>
);
DialogHeaders.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};
