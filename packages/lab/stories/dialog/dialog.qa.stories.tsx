import { Button, Dialog } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { DialogHeader } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab /Dialog Header/Dialog Header QA",
  component: Dialog,
} as Meta<typeof Dialog>;

export const DialogHeaders: StoryFn<QAContainerProps> = () => (
  <QAContainer height={600} cols={1} itemPadding={5} width={1200}>
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
      style={{
        width: 600,
      }}
      header="Terms and conditions"
      preheader="Ensure you read and agree to these Terms"
      description="Effective date: August 29, 2024"
    />
    <DialogHeader
      status="info"
      header="Terms and conditions"
      style={{
        width: 600,
      }}
    />
    <DialogHeader
      actions={
        <Button aria-label="Close dialog" appearance="transparent">
          <CloseIcon aria-hidden />
        </Button>
      }
      status="info"
      style={{
        width: 600,
      }}
      header="Terms and conditions"
    />
    <DialogHeader
      actions={
        <Button aria-label="Close dialog" appearance="transparent">
          <CloseIcon aria-hidden />
        </Button>
      }
      status="info"
      style={{
        width: 600,
      }}
      header="Complete terms and conditions for using the services provided by our company"
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
