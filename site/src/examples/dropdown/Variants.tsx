import { ReactElement } from "react";
import { Dropdown, Option, StackLayout } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Variants = (): ReactElement => (
  <StackLayout>
    <Dropdown style={{ width: "266px" }}>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
    <Dropdown variant="secondary" style={{ width: "266px" }}>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
  </StackLayout>
);
