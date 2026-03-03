import {
  Label,
  ParentChildLayout,
  StackLayout,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";

import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import "./parent-child-layout.stories.css";

export default {
  title: "Core/Layout/Parent Child Layout",
  component: ParentChildLayout,
  args: {
    onCollapseChange: fn(),
  },
} as Meta<typeof ParentChildLayout>;

const parent = <div className="parent-content">Parent</div>;

const child = <div className="child-content">Child</div>;

export const Default: StoryFn<typeof ParentChildLayout> = (args) => (
  <ParentChildLayout {...args} className="parent-child-layout" />
);
Default.args = { parent, child };

export const Collapsed: StoryFn<typeof ParentChildLayout> = (args) => {
  const [visibleView, setVisibleView] = useState<"child" | "parent">("child");

  const handleChange = () => {
    visibleView === "child"
      ? setVisibleView("parent")
      : setVisibleView("child");
  };

  return (
    <StackLayout align="center">
      <ParentChildLayout
        {...args}
        className="parent-child-layout"
        collapseAtBreakpoint="md"
        visibleView={visibleView}
      />
      <StackLayout align="center" gap={1}>
        <Label>Visible View: </Label>
        <ToggleButtonGroup defaultValue="child" onChange={handleChange}>
          <ToggleButton value="parent">Parent</ToggleButton>
          <ToggleButton value="child">Child</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
    </StackLayout>
  );
};

Collapsed.args = {
  parent,
  child,
};

export const ReducedMotion: StoryFn<typeof ParentChildLayout> = (args) => {
  const [visibleView, setVisibleView] = useState<"child" | "parent">("child");

  const handleChange = () => {
    visibleView === "child"
      ? setVisibleView("parent")
      : setVisibleView("child");
  };

  return (
    <StackLayout align="center">
      <div>
        <p>In order to test this on MacOS, follow these steps: </p>
        <p>
          Go to System Preferences, select the Accessibility category, select
          the Display tab, and enable the Reduce Motion option.
        </p>
      </div>
      <ParentChildLayout
        {...args}
        className="parent-child-layout"
        visibleView={visibleView}
        collapseAtBreakpoint="md"
      />
      <StackLayout align="center" gap={1}>
        <Label>Visible View: </Label>
        <ToggleButtonGroup defaultValue="child" onChange={handleChange}>
          <ToggleButton value="parent">Parent</ToggleButton>
          <ToggleButton value="child">Child</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
    </StackLayout>
  );
};

ReducedMotion.args = {
  collapseAtBreakpoint: "xl",
  parent,
  child,
};
