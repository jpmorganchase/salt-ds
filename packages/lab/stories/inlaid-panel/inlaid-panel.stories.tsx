import { Button, FlexItem, FlexLayout, StackLayout, Text } from "@salt-ds/core";
import {
  InlaidPanel,
  InlaidPanelContent,
  InlaidPanelTrigger,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Lab/InlaidPanel",
  component: InlaidPanel,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof InlaidPanel>;

export const Left: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <InlaidPanel open={open} onOpenChange={setOpen}>
      <FlexLayout
        style={{
          height: "100vh",
        }}
        gap={0}
      >
        <InlaidPanelContent
          aria-label="Navigation"
          style={{
            width: 280,
          }}
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
        </InlaidPanelContent>
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
    </InlaidPanel>
  );
};

export const Right: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <InlaidPanel open={open} onOpenChange={setOpen}>
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
        <InlaidPanelContent
          position="right"
          aria-label="Details"
          style={{
            width: 280,
          }}
        >
          <StackLayout>
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
        </InlaidPanelContent>
      </FlexLayout>
    </InlaidPanel>
  );
};

export const Top: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <InlaidPanel open={open} onOpenChange={setOpen}>
      <StackLayout
        gap={0}
        style={{
          height: 400,
        }}
      >
        <InlaidPanelContent
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
        </InlaidPanelContent>
        <FlexItem grow={1}>
          <InlaidPanelTrigger>
            <Button>Toggle Filters</Button>
          </InlaidPanelTrigger>
          <Text>Main content</Text>
        </FlexItem>
      </StackLayout>
    </InlaidPanel>
  );
};

export const Bottom: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <InlaidPanel open={open} onOpenChange={setOpen}>
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
        <InlaidPanelContent
          position="bottom"
          aria-label="Log"
          style={{
            height: 280,
          }}
        >
          <div>
            <Button onClick={() => setOpen(false)}>✕ Close</Button>
            <Text>Log entries</Text>
          </div>
        </InlaidPanelContent>
      </StackLayout>
    </InlaidPanel>
  );
};
