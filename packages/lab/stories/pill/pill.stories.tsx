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
  return (
    <Pill {...args} onClick={handleClick}>
      Basic Pill
    </Pill>
  );
};

export const Default: ComponentStory<typeof Pill> = (args) => {
  return <Pill>Static Pill</Pill>;
};

export const FeaturePill = Template.bind({});

export const Disabled: ComponentStory<typeof Pill> = () => {
  return (
    <Pill disabled onClick={() => console.log("Click")}>
      Disabled Pill
    </Pill>
  );
};

export const Closable: ComponentStory<typeof Pill> = () => {
  return (
    <Pill onClose={() => console.log("Deleted.")} variant="closable">
      Closable Pill
    </Pill>
  );
};

export const DisabledClosable: ComponentStory<typeof Pill> = () => {
  return (
    <Pill disabled onClose={() => console.log("Deleted.")} variant="closable">
      Disabled Closable Pill
    </Pill>
  );
};

export const Icon: ComponentStory<typeof Pill> = () => {
  return (
    <Pill icon={<FavoriteIcon />} onClick={() => console.log("Clicked.")}>
      Pill with Icon
    </Pill>
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
        <Pill variant="deletable">TD Pill</Pill>
      </SaltProvider>
      <SaltProvider density="low">
        <Pill variant="deletable">LD Pill</Pill>
      </SaltProvider>
      <SaltProvider density="medium">
        <Pill variant="deletable">MD Pill</Pill>
      </SaltProvider>
      <SaltProvider density="high">
        <Pill variant="deletable">HD Pill</Pill>
      </SaltProvider>
    </div>
  );
};
