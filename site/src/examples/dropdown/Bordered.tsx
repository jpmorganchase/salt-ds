import { ReactElement } from "react";
import { Dropdown, Option, StackLayout } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Bordered = (): ReactElement => (
  <StackLayout style={{ width: "266px" }}>
    <Dropdown bordered>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
    <Dropdown bordered variant="secondary">
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
  </StackLayout>
);
