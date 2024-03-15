import { ReactElement } from "react";
import { DropdownNext, Option, StackLayout } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Variants = (): ReactElement => (
  <StackLayout>
    <DropdownNext style={{ width: "266px" }}>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </DropdownNext>
    <DropdownNext variant="secondary" style={{ width: "266px" }}>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </DropdownNext>
  </StackLayout>
);
