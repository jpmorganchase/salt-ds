import { Dialog, H2 } from "@salt-ds/core";
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
      header={<H2>Terms and conditions</H2>}
      style={{
        width: 600,
      }}
    />
    <DialogHeader
      style={{
        width: 600,
      }}
      header={<H2>Terms and conditions</H2>}
      preheader="Ensure you read and agree to these Terms"
    />
    <DialogHeader
      style={{
        width: 600,
      }}
      header={<H2>Terms and conditions</H2>}
      preheader="Ensure you read and agree to these Terms"
      description="Effective date: August 29, 2024"
    />
    <DialogHeader
      status="info"
      header={<H2>Terms and conditions</H2>}
      style={{
        width: 600,
      }}
    />
    <DialogHeader
      status="info"
      style={{
        width: 600,
      }}
      header={<H2>Terms and conditions</H2>}
      preheader="Ensure you read and agree to these Terms"
    />
    <DialogHeader
      status="info"
      style={{
        width: 600,
      }}
      header={<H2>Terms and conditions</H2>}
      preheader="Ensure you read and agree to these Terms"
      description="Effective date: August 29, 2024"
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
