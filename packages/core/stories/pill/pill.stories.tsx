import { CloseIcon, FavoriteIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import { Button, Pill, FlowLayout } from "@salt-ds/core";
import { shortColorData } from "../assets/exampleData";

export default {
  title: "Core/Pill",
  component: Pill,
} as Meta<typeof Pill>;

export const Default: StoryFn<typeof Pill> = () => {
  const handleClick = () => {
    console.log("clicked");
  };
  return <Pill onClick={handleClick}>Clickable Pill</Pill>;
};

export const Disabled: StoryFn<typeof Pill> = () => {
  return (
    <Pill disabled onClick={() => console.log("Click")}>
      Disabled Pill
    </Pill>
  );
};

export const Closable: StoryFn<typeof Pill> = () => {
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
        <Pill
          key={color}
          disabled={index < 3}
          onClick={() => removeColor(color)}
        >
          {color} <CloseIcon />
        </Pill>
      ))}
    </FlowLayout>
  );
};

export const Icon: StoryFn<typeof Pill> = () => {
  return (
    <Pill onClick={() => console.log("Clicked.")}>
      <FavoriteIcon /> Pill with Icon
    </Pill>
  );
};
