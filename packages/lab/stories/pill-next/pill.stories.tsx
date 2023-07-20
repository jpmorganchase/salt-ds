/**
 * **NOTE**
 *
 * This file has same title with the .mdx companion file.
 * Stories defined in this/that file may not be shown in the navigation tree after hot reloading.
 * Refresh of a page is needed.
 */

import { SaltProvider } from "@salt-ds/core";
import { Pill as PillNext } from "@salt-ds/lab";
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

const noop = () => undefined;
export const AllDensities: ComponentStory<typeof PillNext> = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: " repeat(4, auto)",
        gap: 16,
      }}
    >
      <SaltProvider density="touch">
        <PillNext onClick={noop} icon={<FavoriteIcon />}>
          TD Pill
        </PillNext>
      </SaltProvider>
      <SaltProvider density="low">
        <PillNext onClick={noop} icon={<FavoriteIcon />}>
          LD Pill
        </PillNext>
      </SaltProvider>
      <SaltProvider density="medium">
        <PillNext onClick={noop} icon={<FavoriteIcon />}>
          MD Pill
        </PillNext>
      </SaltProvider>
      <SaltProvider density="high">
        <PillNext onClick={noop} icon={<FavoriteIcon />}>
          HD Pill
        </PillNext>
      </SaltProvider>
    </div>
  );
};
