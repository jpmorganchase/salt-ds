import { Option, ListBox } from "@salt-ds/core";
import { ReactElement } from "react";
import { shortColorData } from "./exampleData";

export const DisabledOption = (): ReactElement => {
  return (
    <ListBox>
      {shortColorData.slice(0, 5).map((color, index) => (
        <Option disabled={index === 2} value={color} key={color} />
      ))}
    </ListBox>
  );
};
