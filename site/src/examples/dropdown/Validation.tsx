import { ReactElement } from "react";
import { Dropdown, Option, StackLayout } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Validation = (): ReactElement => (
  <StackLayout style={{ width: "266px" }}>
    <Dropdown validationStatus="error">
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
    <Dropdown validationStatus="warning">
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
    <Dropdown validationStatus="success">
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
  </StackLayout>
);
