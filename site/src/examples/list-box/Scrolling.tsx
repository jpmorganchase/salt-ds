import { Option, ListBox } from "@salt-ds/core";
import { ReactElement } from "react";
import { largestCities } from "./exampleData";

export const Scrolling = (): ReactElement => {
  return (
    <ListBox
      style={{
        maxHeight:
          "calc((var(--salt-size-base) + var(--salt-spacing-100)) * 8)",
      }}
    >
      {largestCities.map((city) => (
        <Option value={city.name} key={city.name} />
      ))}
    </ListBox>
  );
};
