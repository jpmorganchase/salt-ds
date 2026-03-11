import { Button, FlexItem, FlexLayout, StackLayout, Text } from "@salt-ds/core";
import {
  InlaidPanel,
  InlaidPanelClose,
  InlaidPanelGroup,
  InlaidPanelTrigger,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Lab/InlaidPanel",
  component: InlaidPanel,
  parameters: {
    layout: "padded",
  },
} as Meta<typeof InlaidPanel>;

// Left panel (default)
export const Left: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <InlaidPanelGroup open={open} onOpenChange={setOpen}>
      <FlexLayout
        style={{
          height: 400,
        }}
        gap={0}
      >
        <InlaidPanel label="Navigation">
          <div>
            <InlaidPanelClose>✕ Close</InlaidPanelClose>
            <nav>Nav content</nav>
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
        <FlexItem>
          <FlexLayout gap={1}>
            <InlaidPanelTrigger>Toggle Navigation</InlaidPanelTrigger>
            <InlaidPanelTrigger>Another Action</InlaidPanelTrigger>
            <Button>More Actions</Button>
          </FlexLayout>
          <Text>Main content</Text>
        </FlexItem>
      </FlexLayout>
    </InlaidPanelGroup>
  );
};

// Right panel
export const Right: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <InlaidPanelGroup open={open} onOpenChange={setOpen}>
      <FlexLayout
        style={{
          height: 400,
        }}
      >
        <FlexItem grow={1}>
          <InlaidPanelTrigger>Toggle Details</InlaidPanelTrigger>
          <Text>Main content</Text>
        </FlexItem>
        <InlaidPanel position="right" label="Details">
          <StackLayout>
            <InlaidPanelClose>✕ Close</InlaidPanelClose>
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
    </InlaidPanelGroup>
  );
};

// Top panel
export const Top: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <InlaidPanelGroup open={open} onOpenChange={setOpen}>
      <StackLayout
        gap={0}
        style={{
          height: 400,
        }}
      >
        <InlaidPanel position="top" label="Filters">
          <StackLayout>
            <InlaidPanelClose>✕ Close</InlaidPanelClose>
            <Text>Filter controls</Text>
          </StackLayout>
        </InlaidPanel>
        <FlexItem grow={1}>
          <InlaidPanelTrigger>Toggle Filters</InlaidPanelTrigger>
          <Text>Main content</Text>
        </FlexItem>
      </StackLayout>
    </InlaidPanelGroup>
  );
};

// Bottom panel
export const Bottom: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <InlaidPanelGroup open={open} onOpenChange={setOpen}>
      <StackLayout
        style={{
          height: 400,
        }}
        gap={0}
      >
        <FlexItem basis={1}>
          <InlaidPanelTrigger>Toggle Log</InlaidPanelTrigger>
          <Text>Main content</Text>
        </FlexItem>
        <InlaidPanel position="bottom" label="Log">
          <StackLayout>
            <InlaidPanelClose>✕ Close</InlaidPanelClose>
            <Text>Log entries</Text>
          </StackLayout>
        </InlaidPanel>
      </StackLayout>
    </InlaidPanelGroup>
  );
};
