/**
 * **NOTE**
 *
 * This file has same title with the .mdx companion file.
 * Stories defined in this/that file may not be shown in the navigation tree after hot reloading.
 * Refresh of a page is needed.
 */

import { SaltProvider } from "@salt-ds/core";
import { Pill } from "@salt-ds/lab";
import { FavoriteIcon } from "@salt-ds/icons";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Pill",
  component: Pill,
} as ComponentMeta<typeof Pill>;

export const Default: ComponentStory<typeof Pill> = () => {
  const handleClick = () => {
    console.log("clicked");
  };
  return <Pill onClick={handleClick}>Clickable Pill</Pill>;
};

export const Disabled: ComponentStory<typeof Pill> = () => {
  return (
    <Pill disabled onClick={() => console.log("Click")}>
      Disabled Pill
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

const noop = () => undefined;
export const AllDensities: ComponentStory<typeof Pill> = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: " repeat(4, auto)",
        gap: 16,
      }}
    >
      <SaltProvider density="touch">
        <Pill onClick={noop} icon={<FavoriteIcon />}>
          TD Pill
        </Pill>
      </SaltProvider>
      <SaltProvider density="low">
        <Pill onClick={noop} icon={<FavoriteIcon />}>
          LD Pill
        </Pill>
      </SaltProvider>
      <SaltProvider density="medium">
        <Pill onClick={noop} icon={<FavoriteIcon />}>
          MD Pill
        </Pill>
      </SaltProvider>
      <SaltProvider density="high">
        <Pill onClick={noop} icon={<FavoriteIcon />}>
          HD Pill
        </Pill>
      </SaltProvider>
    </div>
  );
};
