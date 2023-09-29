import { SyntheticEvent, useState } from "react";
import { SaltProvider } from "@salt-ds/core";
import { Pill } from "@salt-ds/lab";
import { FavoriteIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Pill",
  component: Pill,
} as Meta<typeof Pill>;

const Template: StoryFn<typeof Pill> = (args) => {
  const handleClick = (e: SyntheticEvent<HTMLDivElement>) => {
    console.log("clicked");
    args.onClick?.(e);
  };
  return <Pill label="Basic Pill" {...args} onClick={handleClick} />;
};

export const FeaturePill = Template.bind({});

// This story is referenced in stories/salt/pill.stories.mdx
// named function syntax is used to show the same in code block
export const Controlled: StoryFn<typeof Pill> = () => {
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

export const Disabled: StoryFn<typeof Pill> = () => {
  return (
    <Pill
      disabled
      label="Disabled Pill"
      onDelete={() => console.log("Deleted.")}
    />
  );
};

export const Closable: StoryFn<typeof Pill> = () => {
  return (
    <Pill
      label="Closable Pill"
      onDelete={() => console.log("Deleted.")}
      variant={"closable"}
    />
  );
};

export const DisabledClosable: StoryFn<typeof Pill> = () => {
  return (
    <Pill
      disabled
      label="Disabled Pill"
      onDelete={() => console.log("Deleted.")}
      variant={"closable"}
    />
  );
};

export const Icon: StoryFn<typeof Pill> = () => {
  return (
    <Pill
      icon={<FavoriteIcon />}
      label="Pill with Icon"
      onClick={() => console.log("Clicked.")}
    />
  );
};

export const Selectable: StoryFn<typeof Pill> = () => {
  return (
    <Pill
      label="Selectable Pill"
      onChange={() => console.log("changed")}
      variant="selectable"
    />
  );
};

export const DisabledSelectable: StoryFn<typeof Pill> = () => {
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

export const MaxWidth: StoryFn<typeof Pill> = () => {
  return (
    <>
      <Pill
        label="Extra extra long Pill label example."
        onClick={() => console.log("Clicked.")}
      />
    </>
  );
};

export const CustomTooltipText: StoryFn<typeof Pill> = () => {
  return (
    <Pill
      label="Pill"
      TooltipProps={{ content: "Extra extra long Pill label example." }}
    />
  );
};

export const AllDensities: StoryFn<typeof Pill> = () => {
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
