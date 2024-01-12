import { PillNext } from "@salt-ds/lab";
import { CloseIcon, FavoriteIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import { shortColorData } from "./../assets/exampleData";
import { Button, FlowLayout } from "@salt-ds/core";

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

export const Closable: StoryFn<typeof PillNext> = () => {
  const [colors, setColor] = useState(shortColorData);

  const removeColor = (color: string) => {
    console.log(`Closed ${color}`);
    setColor((oldColors) =>
      oldColors.filter((colorItem) => colorItem !== color)
    );
  };
  return (
    <FlowLayout gap={0.5} style={{ maxWidth: "400px" }}>
      <FlowLayout
        gap={1}
        style={{ flexBasis: "100%", marginBottom: "1.5rem" }}
        align={"center"}
        justify={"space-between"}
      >
        <Button onClick={() => setColor(shortColorData)}>reset</Button>
      </FlowLayout>
      {colors.map((color, index) => (
        <PillNext
          key={color}
          disabled={index < 3}
          onClick={() => removeColor(color)}
        >
          {color} <CloseIcon />
        </PillNext>
      ))}
    </FlowLayout>
  );
};

export const Icon: StoryFn<typeof PillNext> = () => {
  return (
    <PillNext onClick={() => console.log("Clicked.")}>
      <FavoriteIcon /> Pill with Icon
    </PillNext>
  );
};
