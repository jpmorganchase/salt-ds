import { StackLayout } from "@salt-ds/core";
import { Stepper, Step } from "@salt-ds/lab";
import { QAContainer, type QAContainerProps } from "docs/components";

import type { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Stepper/Stepper QA",
  component: Stepper,
  subcomponents: { Step },
} as Meta<typeof Stepper>;

export const Horizontal: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer width={1200} {...props}>
      <StackLayout
        direction="column"
        align="stretch"
        gap={2}
        style={{
          minWidth: 580,
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
          <Step label="Step 1" stage="completed" />
          <Step label="Step 2" stage="active" status="warning" />
          <Step label="Step 3" />
        </Stepper>
        <Stepper orientation="horizontal">
          <Step label="Step 1" stage="completed" />
          <Step label="Step 2" stage="active" status="error" />
          <Step label="Step 3" />
        </Stepper>
        <Stepper orientation="horizontal">
          <Step label="Step 1" stage="completed" />
          <Step label="Step 2" stage="completed" />
          <Step label="Step 3" stage="active" />
        </Stepper>
        <Stepper orientation="horizontal">
          <Step label="Step 1" stage="completed" />
          <Step label="Step 2" stage="completed" />
          <Step label="Step 3" stage="completed" />
        </Stepper>
      </StackLayout>
    </QAContainer>
  );
}

Horizontal.parameters = {
  chromatic: { disableSnapshot: false },
}

export const HorizontalVariations: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer height={480} width={1200} {...props}>
      <StackLayout
        direction="column"
        align="stretch"
        gap={2}
        style={{
          minWidth: 580,
          marginBottom: 24,
        }}
      >
        <Stepper>
          <Step
            label="Step"
            description="Description text"
            stage="pending"
          />
          <Step
            label="Step"
            description="Description text"
            stage="inprogress"
          />
          <Step
            label="Step"
            description="Description text"
            stage="active"
          />
          <Step
            label="Step"
            description="Description text"
            stage="completed"
          />
          <Step
            label="Step"
            description="Description text"
            status="error"
          />
          <Step
            label="Step"
            description="Description text"
            status="warning"
          />
          <Step
            label="Step"
            description="Description text"
            stage="locked"
          />
        </Stepper>
      </StackLayout>
    </QAContainer>
  )
}

HorizontalVariations.parameters = {
  chromatic: { disableSnapshot: false },
}

export const Vertical: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer vertical height={480} width={1240} {...props}>
      <StackLayout
        direction="row"
        align="stretch"
        gap={2}
        style={{
          minWidth: 1240,
        }}
      >
        <Stepper orientation="vertical">
          <Step label="Step 1" />
          <Step label="Step 2" />
          <Step label="Step 3" />
        </Stepper>
        <Stepper orientation="vertical">
          <Step label="Step 1" stage="completed" />
          <Step label="Step 2" stage="active" />
          <Step label="Step 3" />
        </Stepper>
        <Stepper orientation="vertical">
          <Step label="Step 1" stage="completed" />
          <Step label="Step 2" stage="active" status="warning" />
          <Step label="Step 3" />
        </Stepper>
        <Stepper orientation="vertical">
          <Step label="Step 1" stage="completed" />
          <Step label="Step 2" stage="active" status="error" />
          <Step label="Step 3" />
        </Stepper>
        <Stepper orientation="vertical">
          <Step label="Step 1" stage="completed" />
          <Step label="Step 2" stage="completed" />
          <Step label="Step 3" stage="active" />
        </Stepper>
        <Stepper orientation="vertical">
          <Step label="Step 1" stage="completed" />
          <Step label="Step 2" stage="completed" />
          <Step label="Step 3" stage="completed" />
        </Stepper>
      </StackLayout>
    </QAContainer>
  );
}

Vertical.parameters = {
  chromatic: { disableSnapshot: false },
}

export const VerticalVariations: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer height={560} width={1240} {...props}>
      <StackLayout
        direction="column"
        align="stretch"
        gap={2}
        style={{
          minWidth: 1240,
        }}
      >
        <Stepper orientation="vertical">
          <Step
            label="Step"
            description="Description text"
            stage="pending"
          />
          <Step
            label="Step"
            description="Description text"
            stage="inprogress"
          />
          <Step
            label="Step"
            description="Description text"
            stage="active"
          />
          <Step
            label="Step"
            description="Description text"
            stage="completed"
          />
          <Step
            label="Step"
            description="Description text"
            status="error"
          />
          <Step
            label="Step"
            description="Description text"
            status="warning"
          />
          <Step
            label="Step"
            description="Description text"
            stage="locked"
          />
        </Stepper>
      </StackLayout>
    </QAContainer>
  )
}

VerticalVariations.parameters = {
  chromatic: { disableSnapshot: false },
}

export const VerticalNesting: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer height={480} width={1296} {...props}>
      <StackLayout
        direction="row"
        gap={2}
        style={{
          minWidth: 620,
          marginBottom: 40
        }}
      >
        <Stepper orientation="vertical">
          <Step label="Step 1" stage="inprogress">
            <Step label="Step 1.1" stage="completed" />
            <Step label="Step 1.2" stage="inprogress">
              <Step label="Step 1.2.1" stage="active" />
              <Step label="Step 1.2.2" stage="pending" />
            </Step>
          </Step>
        </Stepper>
        <Stepper orientation="vertical">
          <Step label="Step 1" stage="inprogress" defaultExpanded>
            <Step label="Step 1.1" stage="completed" />
            <Step label="Step 1.2" stage="inprogress">
              <Step label="Step 1.2.1" stage="active" />
              <Step label="Step 1.2.2" stage="pending" />
            </Step>
          </Step>
        </Stepper>
        <Stepper orientation="vertical">
          <Step label="Step 1" stage="inprogress" defaultExpanded>
            <Step label="Step 1.1" stage="completed" />
            <Step label="Step 1.2" stage="inprogress" defaultExpanded>
              <Step label="Step 1.2.1" stage="active" />
              <Step label="Step 1.2.2" stage="pending" />
            </Step>
          </Step>
        </Stepper>
      </StackLayout>
    </QAContainer>
  )
}
