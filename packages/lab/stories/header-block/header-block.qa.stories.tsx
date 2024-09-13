import { StackLayout } from "@salt-ds/core";
import { HeaderBlock } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Header Block/Header Block QA",
  component: HeaderBlock,
} as Meta<typeof HeaderBlock>;

export const Basic: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer height={500} width={1000} {...props}>
      <StackLayout
        direction="column"
        align="stretch"
        gap={2}
        style={{
          minWidth: 450,
          marginBottom: 50,
        }}
      >
        <HeaderBlock header="Header Block" onClose={() => {}} accent={true} />
        <HeaderBlock
          header="Header Block"
          preheader="preheader"
          description="description"
          onClose={() => {}}
          accent={true}
        />
        <HeaderBlock
          header="Header Block (no accent)"
          preheader="preheader"
          description="description"
          accent={true}
          onClose={() => {}}
        />
        <HeaderBlock header="Success" status="success" onClose={() => {}} />
      </StackLayout>
    </QAContainer>
  );
};

Basic.parameters = {
  chromatic: { disableSnapshot: false },
};

export const Padding: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer height={500} width={1000} {...props}>
      <StackLayout
        direction="column"
        align="stretch"
        gap={2}
        style={{
          minWidth: 450,
          marginBottom: 50,
        }}
      >
        <HeaderBlock
          header="Header Block: padding 100"
          preheader="preheader"
          description="description"
          onClose={() => {}}
          accent={true}
          padding="100"
        />
        <HeaderBlock
          header="Header Block: padding 200"
          preheader="preheader"
          description="description"
          onClose={() => {}}
          accent={true}
          padding="200"
        />
        <HeaderBlock
          header="Header Block: padding 300"
          preheader="preheader"
          description="description"
          onClose={() => {}}
          accent={true}
          padding="300"
        />
      </StackLayout>
    </QAContainer>
  );
};

Padding.parameters = {
  chromatic: { disableSnapshot: false },
};
