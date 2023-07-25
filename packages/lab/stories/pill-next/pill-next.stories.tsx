/**
 * **NOTE**
 *
 * This file has same title with the .mdx companion file.
 * Stories defined in this/that file may not be shown in the navigation tree after hot reloading.
 * Refresh of a page is needed.
 */

import { SaltProvider } from "@salt-ds/core";
import { PillNext } from "@salt-ds/lab";
import { FavoriteIcon } from "@salt-ds/icons";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Pill Next",
  component: PillNext,
} as ComponentMeta<typeof PillNext>;

export const Default: ComponentStory<typeof PillNext> = () => {
  const handleClick = () => {
    console.log("clicked");
  };
  return <PillNext onClick={handleClick}>Clickable Pill</PillNext>;
};

export const Disabled: ComponentStory<typeof PillNext> = () => {
  return (
    <PillNext disabled onClick={() => console.log("Click")}>
      Disabled Pill
    </PillNext>
  );
};

export const Icon: ComponentStory<typeof PillNext> = () => {
  return (
    <PillNext icon={<FavoriteIcon />} onClick={() => console.log("Clicked.")}>
      Pill with Icon
    </PillNext>
  );
};
