import { Option, ListBox } from "@salt-ds/core";
import { ReactElement } from "react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/list-box/exampleData.ts
import { shortColorData } from "./exampleData";

export const DisabledOption = (): ReactElement => {
  return (
    <ListBox style={{ width: "10em" }}>
      {shortColorData.slice(0, 5).map((color, index) => (
        <Option disabled={index === 2} value={color} key={color} />
      ))}
    </ListBox>
  );
};
