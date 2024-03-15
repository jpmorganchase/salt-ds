import { ReactElement } from "react";
import { DropdownNext, Option, StackLayout } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Readonly = (): ReactElement => (
  <StackLayout>
    <DropdownNext
      defaultSelected={["California"]}
      readOnly
      style={{ width: "266px" }}
    >
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </DropdownNext>
    <DropdownNext readOnly style={{ width: "266px" }}>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </DropdownNext>
  </StackLayout>
);
