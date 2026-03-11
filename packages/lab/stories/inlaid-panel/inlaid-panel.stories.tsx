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
      <div
        style={{
          display: "flex",
          height: 400,
        }}
      >
        <InlaidPanel label="Navigation">
          <div>
            <InlaidPanelClose>✕ Close</InlaidPanelClose>
            <nav>Nav content</nav>
            <button>Button 1</button>
            <button>Button 2</button>
            <div>
              <p>Details panel</p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
                repudiandae, ullam nihil architecto neque rerum necessitatibus
                blanditiis? Iusto expedita dolore et doloribus officiis.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
                repudiandae, ullam nihil architecto neque rerum necessitatibus
                blanditiis? Iusto expedita dolore et doloribus officiis.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
                repudiandae, ullam nihil architecto neque rerum necessitatibus
                blanditiis? Iusto expedita dolore et doloribus officiis.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
                repudiandae, ullam nihil architecto neque rerum necessitatibus
                blanditiis? Iusto expedita dolore et doloribus officiis.
              </p>
            </div>
          </div>
        </InlaidPanel>
        <main style={{ flex: 1, padding: "var(--salt-spacing-200)" }}>
          <InlaidPanelTrigger>Toggle Navigation</InlaidPanelTrigger>
          <button>Another Action</button>
          <button>More Actions</button>
          <p>Main content</p>
        </main>
      </div>
    </InlaidPanelGroup>
  );
};

// Right panel
export const Right: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <InlaidPanelGroup open={open} onOpenChange={setOpen}>
      <div
        style={{
          display: "flex",
          height: 400,
        }}
      >
        <main style={{ flex: 1, padding: "var(--salt-spacing-200)" }}>
          <InlaidPanelTrigger>Toggle Details</InlaidPanelTrigger>
          <p>Main content</p>
        </main>
        <InlaidPanel position="right" label="Details">
          <div>
            <InlaidPanelClose>✕ Close</InlaidPanelClose>
            <div>
              <p>Details panel</p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
                repudiandae, ullam nihil architecto neque rerum necessitatibus
                blanditiis? Iusto expedita dolore et doloribus officiis.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
                repudiandae, ullam nihil architecto neque rerum necessitatibus
                blanditiis? Iusto expedita dolore et doloribus officiis.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
                repudiandae, ullam nihil architecto neque rerum necessitatibus
                blanditiis? Iusto expedita dolore et doloribus officiis.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Eligendi, a. Dignissimos aperiam, aut temporibus voluptatum non
                repudiandae, ullam nihil architecto neque rerum necessitatibus
                blanditiis? Iusto expedita dolore et doloribus officiis.
              </p>
            </div>
          </div>
        </InlaidPanel>
      </div>
    </InlaidPanelGroup>
  );
};

// Top panel
export const Top: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <InlaidPanelGroup open={open} onOpenChange={setOpen}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: 400,
        }}
      >
        <InlaidPanel position="top" label="Filters">
          <div>
            <InlaidPanelClose>✕ Close</InlaidPanelClose>
            <p>Filter controls</p>
          </div>
        </InlaidPanel>
        <main style={{ flex: 1, padding: "var(--salt-spacing-200)" }}>
          <InlaidPanelTrigger>Toggle Filters</InlaidPanelTrigger>
          <p>Main content</p>
        </main>
      </div>
    </InlaidPanelGroup>
  );
};

// Bottom panel
export const Bottom: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <InlaidPanelGroup open={open} onOpenChange={setOpen}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: 400,
        }}
      >
        <main style={{ flex: 1, padding: "var(--salt-spacing-200)" }}>
          <InlaidPanelTrigger>Toggle Log</InlaidPanelTrigger>
          <p>Main content</p>
        </main>
        <InlaidPanel position="bottom" label="Log">
          <div>
            <InlaidPanelClose>✕ Close</InlaidPanelClose>
            <p>Log entries</p>
          </div>
        </InlaidPanel>
      </div>
    </InlaidPanelGroup>
  );
};
