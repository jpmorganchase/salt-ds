import { ReactElement } from "react";
import { DropdownNext, Option } from "@salt-ds/lab";
import { shortColorData } from "./exampleData";
import { StackLayout } from "@salt-ds/core";

export const Validation = (): ReactElement => (
  <StackLayout style={{ width: "266px" }}>
    <DropdownNext validationStatus="error">
      {shortColorData.map((color) => (
        <Option value={color} key={color}>
          {color}
        </Option>
      ))}
    </DropdownNext>
    <DropdownNext validationStatus="warning">
      {shortColorData.map((color) => (
        <Option value={color} key={color}>
          {color}
        </Option>
      ))}
    </DropdownNext>
    <DropdownNext validationStatus="success">
      {shortColorData.map((color) => (
        <Option value={color} key={color}>
          {color}
        </Option>
      ))}
    </DropdownNext>
  </StackLayout>
);
