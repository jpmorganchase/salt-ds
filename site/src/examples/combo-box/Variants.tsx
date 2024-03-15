import { ReactElement } from "react";
import { ComboBox, Option, StackLayout } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Variants = (): ReactElement => (
  <StackLayout style={{ width: "266px" }}>
    <ComboBox>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </ComboBox>
    <ComboBox variant="secondary">
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </ComboBox>
  </StackLayout>
);
