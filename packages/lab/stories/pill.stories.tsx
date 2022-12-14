/**
 * **NOTE**
 *
 * This file has same title with the .mdx companion file.
 * Stories defined in this/that file may not be shown in the navigation tree after hot reloading.
 * Refresh of a page is needed.
 */

import { SyntheticEvent, useState } from "react";
import { SaltProvider } from "@salt-ds/core";
import { Pill } from "@salt-ds/lab";
import { FavoriteIcon } from "@salt-ds/icons";
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

// This story is referenced in stories/salt/pill.stories.mdx
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

export const DisabledPill: ComponentStory<typeof Pill> = () => {
  return (
    <Pill
      disabled
      label="Disabled Pill"
      onDelete={() => console.log("Deleted.")}
    />
  );
};

export const ClosablePill: ComponentStory<typeof Pill> = () => {
  return (
    <Pill
      label="Closable Pill"
      onDelete={() => console.log("Deleted.")}
      variant={"closable"}
    />
  );
};

export const DisabledClosablePill: ComponentStory<typeof Pill> = () => {
  return (
    <Pill
      disabled
      label="Disabled Pill"
      onDelete={() => console.log("Deleted.")}
      variant={"closable"}
    />
  );
};

export const IconPill: ComponentStory<typeof Pill> = () => {
  return (
    <Pill
      icon={<FavoriteIcon />}
      label="Pill with Icon"
      onClick={() => console.log("Clicked.")}
    />
  );
};

export const SelectablePill: ComponentStory<typeof Pill> = () => {
  return (
    <Pill
      label="Selectable Pill"
      onChange={() => console.log("changed")}
      variant="selectable"
    />
  );
};

export const DisabledSelectablePill: ComponentStory<typeof Pill> = () => {
  return (
    <Pill
      label="Selectable Pill"
      onChange={() => console.log("changed")}
      variant="selectable"
      defaultChecked
      disabled={true}
    />
  );
};

export const MaxWidthPill: ComponentStory<typeof Pill> = () => {
  return (
    <>
      <Pill
        label="Extra extra long Pill label example."
        onClick={() => console.log("Clicked.")}
      />
    </>
  );
};

export const CustomTooltipTextPill: ComponentStory<typeof Pill> = () => {
  return (
    <Pill
      label="Pill"
      TooltipProps={{ title: "Extra extra long Pill label example." }}
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
      <SaltProvider density="touch">
        <Pill label="TD Pill" deletable />
      </SaltProvider>
      <SaltProvider density="low">
        <Pill label="LD Pill" deletable />
      </SaltProvider>
      <SaltProvider density="medium">
        <Pill label="MD Pill" deletable />
      </SaltProvider>
      <SaltProvider density="high">
        <Pill label="HD Pill" deletable />
      </SaltProvider>
    </div>
  );
};
