import { ComboBox, Option, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import { shortColorData } from "./exampleData";

export const Bordered = (): ReactElement => {
  return (
    <StackLayout>
      <ComboBox bordered style={{ width: "266px" }}>
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBox>
      <ComboBox bordered variant="secondary" style={{ width: "266px" }}>
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBox>
      <ComboBox bordered variant="tertiary" style={{ width: "266px" }}>
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBox>
    </StackLayout>
  );
};
