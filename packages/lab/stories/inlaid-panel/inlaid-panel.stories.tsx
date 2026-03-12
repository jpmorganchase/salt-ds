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
          height: "100vh",
        }}
        gap={0}
      >
        <InlaidPanel aria-label="Navigation">
          <div>
            <InlaidPanelClose>✕ Close</InlaidPanelClose>
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
        <FlexItem>
          <FlexLayout gap={1}>
            <InlaidPanelTrigger>
              <Button>Toggle Navigation</Button>
            </InlaidPanelTrigger>
            <InlaidPanelTrigger>
              <Button>Another Action</Button>
            </InlaidPanelTrigger>
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
          height: "100vh",
        }}
      >
        <FlexItem grow={1}>
          <InlaidPanelTrigger>
            <Button>Toggle Details</Button>
          </InlaidPanelTrigger>
          <Text>Main content</Text>
        </FlexItem>
        <InlaidPanel position="right" aria-label="Details">
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
        <InlaidPanel position="top" aria-label="Filters">
          <div>
            <InlaidPanelClose>✕ Close</InlaidPanelClose>
            <Text>Filter controls</Text>
          </div>
        </InlaidPanel>
        <FlexItem grow={1}>
          <InlaidPanelTrigger>
            <Button>Toggle Filters</Button>
          </InlaidPanelTrigger>
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
          height: "100vh",
        }}
        gap={0}
      >
        <FlexItem grow={1}>
          <InlaidPanelTrigger>
            <Button>Toggle Log</Button>
          </InlaidPanelTrigger>
          <Text>Main content</Text>
        </FlexItem>
        <InlaidPanel position="bottom" aria-label="Log">
          <div>
            <InlaidPanelClose>✕ Close</InlaidPanelClose>
            <Text>Log entries</Text>
          </div>
        </InlaidPanel>
      </StackLayout>
    </InlaidPanelGroup>
  );
};
