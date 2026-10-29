import { Dropdown, Option, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import { shortColorData } from "./exampleData";

export const Validation = (): ReactElement => (
  <StackLayout style={{ width: "266px" }}>
    <Dropdown aria-label="Color" validationStatus="error">
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
    <Dropdown aria-label="Color" validationStatus="warning">
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
    <Dropdown aria-label="Color" validationStatus="success">
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
  </StackLayout>
);
