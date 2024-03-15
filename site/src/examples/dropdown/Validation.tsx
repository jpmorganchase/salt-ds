import { ReactElement } from "react";
import { DropdownNext, Option, StackLayout } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Validation = (): ReactElement => (
  <StackLayout style={{ width: "266px" }}>
    <DropdownNext validationStatus="error">
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </DropdownNext>
    <DropdownNext validationStatus="warning">
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </DropdownNext>
    <DropdownNext validationStatus="success">
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </DropdownNext>
  </StackLayout>
);
