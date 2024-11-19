import type { Meta, StoryFn } from "@storybook/react";
import { Stepper, Step, type StepProps } from '@salt-ds/lab'
import { LockedIcon } from '@salt-ds/icons';

import { StackLayout } from '@salt-ds/core';

export default {
  title: "Lab/Stepper",
  component: Stepper,
  subcomponents: { Step },
} as Meta<typeof Stepper>;

export const Horizontal: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout
      gap={10}
      style={{
        minWidth: '640px',
        width: '100%',
      }}
    >
      <Stepper>
        <Step label="Step 1" stage="completed" />
        <Step label="Step 2" stage="active" />
        <Step label="Step 3" />
      </Stepper>
    </StackLayout>
  )
}

export const HorizontalVariations: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout
      style={{
        minWidth: '640px',
        width: '100%',
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
      </Stepper>
    </StackLayout>
  )
}

export const HorizontalLongText: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout
      style={{
        maxWidth: '320px',
        width: '100%'
      }}
    >
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
    <StackLayout
      gap={10}
      style={{
        minWidth: '240px',
        width: '100%',
      }}
    >
      <Stepper orientation="vertical">
        <Step label="Step 1" stage="completed" />
        <Step label="Step 2" stage="active" />
        <Step label="Step 3" />
      </Stepper>
    </StackLayout>
  )
}

export const VerticalVariations: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout style={{ maxWidth: '240px', width: '100%' }}>
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
      </Stepper>
    </StackLayout>
  )
}

export const VerticalLongText: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout
      gap={10}
      style={{
        maxWidth: '240px',
        width: '100%',
      }}
    >
      <Stepper orientation="vertical">
        <Step
          label="This is a ridiculous long line of text showcasing a step label"
          description="lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate magni dignissimos inventore incidunt facere harum expedita beatae reiciendis numquam iste excepturi dolorum omnis optio ullam quam illum, eligendi perspiciatis quia."
          stage="completed"
        />
        <Step
          label="Oh no!"
          description="lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate magni dignissimos inventore incidunt facere harum expedita beatae reiciendis numquam iste excepturi dolorum omnis optio ullam quam illum, eligendi perspiciatis quia."

          status="error"
        />
        <Step
          label="Last step"
          description="lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate magni dignissimos inventore incidunt facere harum expedita beatae reiciendis numquam iste excepturi dolorum omnis optio ullam quam illum, eligendi perspiciatis quia."

          status="warning"
        />
      </Stepper>
    </StackLayout>
  )
}

export const VerticalDepth1: StoryFn<typeof Stepper> = () => {
  return (
    <StackLayout style={{ maxWidth: '240px', width: '100%' }}>
      <Stepper orientation="vertical">
        <Step label="Step 1" description="Description text">
          <Step label="Step 1.1" />
        </Step>
        <Step label="Step 2">
          <Step label="Step 2.1" description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate magni dignissimos inventore incidunt facere harum expedita beatae reiciendis numquam iste excepturi dolorum omnis optio ullam quam illum, eligendi perspiciatis quia." />
          <Step label="Step 2.2" description="Description text" />
        </Step>
        <Step label="Step 3">
          <Step label="Step 3.1" />
          <Step label="Step 3.2" description="Description text" />
          <Step label="Step 3.3" description="This is just a description text" />
        </Step>
      </Stepper>
    </StackLayout>
  )
}

export const VerticalDepth2: StoryFn<typeof Stepper> = () => {
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
          <Step label="Step 3.3" description="This is just a description text">
            <Step label="Step 3.3.1" />
            <Step label="Step 3.3.2" />
            <Step label="Step 3.3.3" description="This is just a description text" />
          </Step>
        </Step>
      </Stepper>
    </StackLayout>
  )
}
