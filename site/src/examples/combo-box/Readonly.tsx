import { ReactElement } from "react";
import { ComboBoxNext, Option, StackLayout } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Readonly = (): ReactElement => {
  return (
    <StackLayout>
      <ComboBoxNext
        defaultValue="Yellow"
        defaultSelected={["Yellow"]}
        readOnly
        style={{ width: "266px" }}
      >
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBoxNext>
      <ComboBoxNext readOnly style={{ width: "266px" }}>
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBoxNext>
    </StackLayout>
  );
};
