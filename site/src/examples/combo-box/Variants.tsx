import { ReactElement } from "react";
import { ComboBoxNext, Option, StackLayout } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Variants = (): ReactElement => (
  <StackLayout style={{ width: "266px" }}>
    <ComboBoxNext>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </ComboBoxNext>
    <ComboBoxNext variant="secondary">
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </ComboBoxNext>
  </StackLayout>
);
