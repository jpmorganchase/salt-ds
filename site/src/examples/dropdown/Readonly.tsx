import { ReactElement } from "react";
import { Dropdown, Option, StackLayout } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Readonly = (): ReactElement => (
  <StackLayout>
    <Dropdown
      defaultSelected={["California"]}
      readOnly
      style={{ width: "266px" }}
    >
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
    <Dropdown readOnly style={{ width: "266px" }}>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
  </StackLayout>
);
