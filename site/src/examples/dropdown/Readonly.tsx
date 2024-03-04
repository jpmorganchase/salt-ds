import { ReactElement } from "react";
import { DropdownNext, Option } from "@salt-ds/lab";
import { shortColorData } from "./exampleData";
import { StackLayout } from "@salt-ds/core";

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
