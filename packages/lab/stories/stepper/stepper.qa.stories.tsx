import { StackLayout } from "@salt-ds/core";
import { Stepper, Step } from "@salt-ds/lab";
import { QAContainer, type QAContainerProps } from "docs/components";

import type { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Stepper/Stepped QA",
  component: Stepper,
  subcomponents: { Step },
} as Meta<typeof Stepper>;

export const Horizontal: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer height={800} width={1000} {...props}>
      <StackLayout
        direction="column"
        align="stretch"
        gap={2}
        style={{
          minWidth: 450,
          marginBottom: 50,
        }}
      >
        <Stepper orientation="horizontal">
          <Step label="Step 1" />
          <Step label="Step 2" />
          <Step label="Step 3" />
        </Stepper>
        <Stepper orientation="horizontal">
          <Step label="Step 1" stage="completed" />
          <Step label="Step 2" stage="active" />
          <Step label="Step 3" />
        </Stepper>
        <Stepper orientation="horizontal">
          <Step label="Step 1" description="Completed" stage="completed" />
          <Step label="Step 1" description="Completed with warning" stage="completed" status="warning"  />
          <Step label="Step 1" description="Completed" stage="completed" />
        </Stepper>
        <Stepper orientation="horizontal">
          <Step label="Step 1" description="Completed" stage="completed" />
          <Step label="Step 1" description="Completed with error" stage="completed" status="error"  />
          <Step label="Step 1" description="Completed" stage="completed" />
        </Stepper>
      </StackLayout>
    </QAContainer>
  );
}

Horizontal.parameters = {
  chromatic: { disableSnapshot: false },
}