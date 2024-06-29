import { ComboBox, Option, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import { shortColorData } from "./exampleData";

export const Readonly = (): ReactElement => {
  return (
    <StackLayout>
      <ComboBox
        defaultValue="Yellow"
        defaultSelected={["Yellow"]}
        readOnly
        style={{ width: "266px" }}
      >
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBox>
      <ComboBox readOnly style={{ width: "266px" }}>
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBox>
    </StackLayout>
  );
};
