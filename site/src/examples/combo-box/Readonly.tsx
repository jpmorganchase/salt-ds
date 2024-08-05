import { ComboBox, Option, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import { shortColorData } from "./exampleData";

export const Readonly = (): ReactElement => {
  return (
    <StackLayout style={{ width: "266px" }}>
      <ComboBox defaultValue="Yellow" defaultSelected={["Yellow"]} readOnly>
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBox>
      <ComboBox readOnly multiselect defaultSelected={["Yellow", "Green"]}>
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBox>
      <ComboBox readOnly>
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBox>
    </StackLayout>
  );
};
