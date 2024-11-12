import type { Meta, StoryFn } from "@storybook/react";

import { Stepper, Step } from '@salt-ds/lab'
import { StackLayout } from '@salt-ds/core';

export default {
  title: "Lab/Stepper",
  component: Stepper,
  subcomponents: { Step },
} as Meta<typeof Stepper>;

export const Basic: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout style={{ minWidth: '800px', width: '100%' }}>
      <Stepper>
        <Step label="Step" stage="completed" />
        <Step label="Step" stage="active" />
        <Step label="Step" />
        <Step label="Step" />
        <Step label="Step" />
      </Stepper>
    </StackLayout>
  )
}

export const Variations: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout style={{ maxWidth: '800px', width: '100%' }}>
      <Stepper>
        <Step
          label="Step"
          description="Description text"
          stage="pending"
        />
        <Step
          label="Step"
          description="Description text"
          stage="active"
        />
        <Step
          label="Step"
          description="Description text"
          stage="inprogress"
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
      </Stepper>
    </StackLayout>
  )
}

export const LongText: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout style={{ maxWidth: '320px', width: '100%' }}>
      <Stepper>
        <Step
          label="This is a ridiculous long line of text showcasing a step label"
          description="This is just a description text"
          stage="completed"
        />
        <Step
          label="Oh no!"
          description="This is another ridiculous long line of text showcasing an error message"
          status="error"
        />
        <Step
          label="Last step"
          description="This is another ridiculous long line of text to test a warning message"
          status="warning"
        />
      </Stepper>
    </StackLayout>
  )
}

export const Vertical: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout style={{ maxWidth: '240px', width: '100%' }}>
      <Stepper orientation="vertical">
        <Step
          label="Step"
          description="Description text"
          stage="pending"
          asChild
        >
          </Step>
        <Step
          label="Step"
          description="Description text"
          stage="active"
        />
        <Step
          label="Step"
          description="Description text"
          stage="inprogress"
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
      </Stepper>
    </StackLayout>
  )
}

export const VerticalNestedOnce: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout style={{ maxWidth: '240px', width: '100%' }}>
      <Stepper orientation="vertical">
        <Step label="Step 1" description="Description text">
          <Step label="Step 1.1" />
        </Step>
        <Step label="Step 2">
          <Step label="Step 2.1" description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate magni dignissimos inventore incidunt facere harum expedita beatae reiciendis numquam iste excepturi dolorum omnis optio ullam quam illum, eligendi perspiciatis quia." />
          <Step label="Step 2.2" description="Description text">
            <Step label="Step 2.2.1" />
            <Step label="Step 2.2.2" />
            <Step label="Step 2.2.3" />
          </Step>
        </Step>
        <Step label="Step 3">
          <Step label="Step 3.1" />
          <Step label="Step 3.2" description="Description text" />
          <Step label="Step 3.3" />
        </Step>
      </Stepper>
    </StackLayout>
  )
}
