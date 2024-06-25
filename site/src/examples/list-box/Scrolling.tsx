import { Option, ListBox } from "@salt-ds/core";
import { ReactElement } from "react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/list-box/exampleData.ts
import { largestCities } from "./exampleData";

export const Scrolling = (): ReactElement => {
  return (
    <div style={{ maxHeight: 500 }}>
      <ListBox
        style={{
          width: "10em",
        }}
      >
        {largestCities.map((city) => (
          <Option value={city.name} key={city.name} />
        ))}
      </ListBox>
    </div>
  );
};
