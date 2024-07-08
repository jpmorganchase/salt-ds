import { ListBox, Option } from "@salt-ds/core";
import type { ReactElement } from "react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/list-box/exampleData.ts
import { shortColorData } from "./exampleData";

export const Bordered = (): ReactElement => {
  return (
    <ListBox bordered style={{ width: "10em" }}>
      {shortColorData.slice(0, 5).map((color) => (
        <Option value={color} key={color} />
      ))}
    </ListBox>
  );
};
