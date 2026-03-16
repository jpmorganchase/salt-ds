import { Button, FlexItem, FlexLayout, StackLayout, Text } from "@salt-ds/core";
import { InlaidPanel } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Lab/InlaidPanel",
  component: InlaidPanel,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof InlaidPanel>;

export const Default: StoryFn = () => {
  const [open, setOpen] = useState(false);

  return (
    <FlexLayout
      style={{
        height: "100vh",
      }}
      gap={0}
    >
      <InlaidPanel
        open={open}
        aria-label="Navigation"
        style={
          {
            "--saltInlaidPanel-width": "500px",
          } as React.CSSProperties
        }
      >
        <div>
          <Button onClick={() => setOpen(false)}>✕ Close</Button>
          <Text>Nav content</Text>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
          <StackLayout>
            <Text>Details panel</Text>
            <Text>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
              repudiandae, ullam nihil architecto neque rerum necessitatibus
              blanditiis? Iusto expedita dolore et doloribus officiis.
            </Text>
            <Text>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
              repudiandae, ullam nihil architecto neque rerum necessitatibus
              blanditiis? Iusto expedita dolore et doloribus officiis.
            </Text>
            <Text>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
              repudiandae, ullam nihil architecto neque rerum necessitatibus
              blanditiis? Iusto expedita dolore et doloribus officiis.
            </Text>
            <Text>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
              repudiandae, ullam nihil architecto neque rerum necessitatibus
              blanditiis? Iusto expedita dolore et doloribus officiis.
            </Text>
          </StackLayout>
        </div>
      </InlaidPanel>
      <FlexLayout gap={1} padding={1}>
        <Button onClick={() => setOpen(!open)}>Open Left Panel</Button>
        <Button onClick={() => setOpen(true)}>Button 1</Button>
        <Button>Button 2</Button>
        <Button>Button 3</Button>
      </FlexLayout>
    </FlexLayout>
  );
};

export const Right: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <FlexLayout
      style={{
        height: "100vh",
      }}
    >
      <FlexItem grow={1} padding={1}>
        <Button onClick={() => setOpen(!open)}>Toggle Details</Button>
        <Text>Main content</Text>
      </FlexItem>
      <InlaidPanel
        open={open}
        position="right"
        aria-label="Details"
      >
        <StackLayout align="start">
          <Button onClick={() => setOpen(false)}>✕ Close</Button>
          <StackLayout>
            <Text>Details panel</Text>
            <Text>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
              repudiandae, ullam nihil architecto neque rerum necessitatibus
              blanditiis? Iusto expedita dolore et doloribus officiis.
            </Text>
            <Text>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
              repudiandae, ullam nihil architecto neque rerum necessitatibus
              blanditiis? Iusto expedita dolore et doloribus officiis.
            </Text>
            <Text>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
              repudiandae, ullam nihil architecto neque rerum necessitatibus
              blanditiis? Iusto expedita dolore et doloribus officiis.
            </Text>
            <Text>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
              repudiandae, ullam nihil architecto neque rerum necessitatibus
              blanditiis? Iusto expedita dolore et doloribus officiis.
            </Text>
          </StackLayout>
        </StackLayout>
      </InlaidPanel>
    </FlexLayout>
  );
};

export const Top: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <StackLayout gap={0}>
      <InlaidPanel
        open={open}
        position="top"
        aria-label="Filters"
        style={{
          height: 280,
        }}
      >
        <div>
          <Button onClick={() => setOpen(false)}>✕ Close</Button>
          <Text>Filter controls</Text>
        </div>
      </InlaidPanel>
      <FlexItem padding={1}>
        <Button onClick={() => setOpen(!open)}>Toggle Filters</Button>
        <Text>Main content</Text>
      </FlexItem>
    </StackLayout>
  );
};

export const Bottom: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <StackLayout
      style={{
        height: "100vh",
      }}
      gap={0}
    >
      <FlexItem grow={1} padding={1}>
        <Button onClick={() => setOpen(!open)}>Toggle Log</Button>
        <Text>Main content</Text>
      </FlexItem>
      <InlaidPanel
        open={open}
        position="bottom"
        aria-label="Log"
      >
        <div>
          <Button onClick={() => setOpen(false)}>✕ Close</Button>
          <Text>Log entries</Text>
        </div>
      </InlaidPanel>
    </StackLayout>
  );
};
