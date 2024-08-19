import { ComboBox, Option, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import { shortColorData } from "./exampleData";

export const Disabled = (): ReactElement => {
  return (
    <StackLayout style={{ width: "266px" }}>
      <ComboBox defaultSelected={["Yellow"]} disabled>
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBox>
      <ComboBox defaultSelected={["Yellow", "Green"]} disabled multiselect>
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBox>
    </StackLayout>
  );
};
