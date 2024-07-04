import { ReactElement } from "react";
import { ComboBox, Option, StackLayout } from "@salt-ds/core";
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
    </StackLayout>
  );
};
