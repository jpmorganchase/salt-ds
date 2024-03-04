import { ReactElement } from "react";
import { ComboBoxNext, Option } from "@salt-ds/lab";
import { shortColorData } from "./exampleData";
import { StackLayout } from "@salt-ds/core";

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
