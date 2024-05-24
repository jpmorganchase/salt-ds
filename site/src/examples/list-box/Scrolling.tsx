import { Option, ListBox } from "@salt-ds/core";
import { ReactElement } from "react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/list-box/exampleData.ts
import { largestCities } from "./exampleData";

export const Scrolling = (): ReactElement => {
  return (
    <ListBox
      style={{
        maxHeight:
          "calc((var(--salt-size-base) + var(--salt-spacing-100)) * 8)",
        width: "30%",
      }}
    >
      {largestCities.map((city) => (
        <Option value={city.name} key={city.name} />
      ))}
    </ListBox>
  );
};
