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
            title={`dialog ${density} example`}
            src={`/iframe.html?globals=density:${density}&args=open:!true&id=core-dialog--default&viewMode=story`}
            style={{ border: "none", width: 1200, height: 380 }}
          />
          <iframe
            title={`dialog ${density} in dark mode example`}
            src={`/iframe.html?globals=mode:dark;density:${density}&args=open:!true&id=core-dialog--default&viewMode=story`}
            style={{ border: "none", width: 1200, height: 380 }}
          />
          {VALIDATION_NAMED_STATUS.map((status) => (
            <Fragment key={status}>
              <iframe
                title={`dialog ${density} ${status} example`}
                src={`/iframe.html?globals=density:${density}&args=open:!true;status:${status}&id=core-dialog--default&viewMode=story`}
                style={{ border: "none", width: 1200, height: 380 }}
              />
              <iframe
                title={`dialog ${density} ${status} in dark mode example`}
                src={`/iframe.html?globals=mode:dark;density:${density}&args=open:!true;status:${status}&id=core-dialog--default&viewMode=story`}
                style={{ border: "none", width: 1200, height: 380 }}
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
  return (
    <FlowLayout gap={0}>
      {DensityValues.map((density) => (
        <Fragment key={density}>
          <FlowLayout>
            <iframe
              title={`dialog ${density} small example`}
              src={`/iframe.html?globals=density:${density}&args=open:!true;size:small&id=core-dialog--default&viewMode=story`}
              style={{ border: "none", width: 400, height: 380 }}
            />
            <iframe
              title={`dialog ${density} medium example`}
              src={`/iframe.html?globals=density:${density}&args=open:!true;size:medium&id=core-dialog--default&viewMode=story`}
              style={{ border: "none", width: 800, height: 380 }}
            />
            <iframe
              title={`dialog ${density} large example`}
              src={`/iframe.html?globals=density:${density}&args=open:!true;size:large&id=core-dialog--default&viewMode=story`}
              style={{ border: "none", width: 1200, height: 380 }}
            />
          </FlowLayout>
          <iframe
            title={`dialog ${density} sticky footer example`}
            src={`/iframe.html?globals=density:${density}&args=open:!true&id=core-dialog--sticky-footer&viewMode=story`}
            style={{ border: "none", width: 1200, height: 380 }}
          />
          <iframe
            title={`dialog ${density} sticky footer in dark mode example`}
            src={`/iframe.html?globals=mode:dark;density:${density}&args=open:!true&id=core-dialog--sticky-footer&viewMode=story`}
            style={{ border: "none", width: 1200, height: 380 }}
          />
          <iframe
            title={`dialog ${density} long content example`}
            src={`/iframe.html?globals=density:${density}&args=open:!true&id=core-dialog--long-content&viewMode=story`}
            style={{ border: "none", width: 1200, height: 380 }}
          />
          <iframe
            title={`dialog ${density} long content in dark mode example`}
            src={`/iframe.html?globals=mode:dark;density:${density}&args=open:!true&id=core-dialog--long-content&viewMode=story`}
            style={{ border: "none", width: 1200, height: 380 }}
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
