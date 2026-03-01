import { ComboBox, Option, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
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
    <ComboBox variant="tertiary">
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </ComboBox>
  </StackLayout>
);
