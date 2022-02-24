/**
 * **NOTE**
 *
 * This file has same title with the .mdx companion file.
 * Stories defined in this/that file may not be shown in the navigation tree after hot reloading.
 * Refresh of a page is needed.
 */

import { useState, SyntheticEvent } from "react";
import { ToolkitProvider } from "@brandname/core";
import { Pill } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Pill",
  component: Pill,
} as ComponentMeta<typeof Pill>;

const Template: ComponentStory<typeof Pill> = (args) => {
  const handleClick = (e: SyntheticEvent<HTMLDivElement>) => {
    console.log("clicked");
    args.onClick?.(e);
  };
  return <Pill label="Basic Pill" {...args} onClick={handleClick} />;
};

export const FeaturePill = Template.bind({});

// This story is referenced in stories/toolkit/pill.stories.mdx
// named function syntax is used to show the same in code block
export const ControlledPill: ComponentStory<typeof Pill> = () => {
  const [checked, setChecked] = useState(true);

  const handleChange = () => {
    setChecked((c) => !c);
  };

  return (
    <Pill
      label="Controlled Pill"
      variant="selectable"
      checked={checked}
      onChange={handleChange}
    />
  );
};

export const AllDensities: ComponentStory<typeof Pill> = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: " repeat(4, auto)",
        gridColumnGap: 16,
      }}
    >
      <ToolkitProvider density="touch">
        <Pill label="TD Pill" deletable />
      </ToolkitProvider>
      <ToolkitProvider density="low">
        <Pill label="LD Pill" deletable />
      </ToolkitProvider>
      <ToolkitProvider density="medium">
        <Pill label="MD Pill" deletable />
      </ToolkitProvider>
      <ToolkitProvider density="high">
        <Pill label="HD Pill" deletable />
      </ToolkitProvider>
    </div>
  );
};
