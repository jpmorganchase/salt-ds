import { PillNext } from "@salt-ds/lab";
import { FavoriteIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Pill Next",
  component: PillNext,
} as Meta<typeof PillNext>;

export const Default: StoryFn<typeof PillNext> = () => {
  const handleClick = () => {
    console.log("clicked");
  };
  return <PillNext onClick={handleClick}>Clickable Pill</PillNext>;
};

export const Disabled: StoryFn<typeof PillNext> = () => {
  return (
    <PillNext disabled onClick={() => console.log("Click")}>
      Disabled Pill
    </PillNext>
  );
};

export const Icon: StoryFn<typeof PillNext> = () => {
  return (
    <PillNext icon={<FavoriteIcon />} onClick={() => console.log("Clicked.")}>
      Pill with Icon
    </PillNext>
  );
};
