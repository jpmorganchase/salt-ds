import { ComboBox, Option } from "@salt-ds/core";
import type { ReactElement } from "react";
import { shortColorData } from "./exampleData";

export const Disabled = (): ReactElement => {
  return (
    <ComboBox style={{ width: "266px" }} defaultSelected={["Yellow"]} disabled>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </ComboBox>
  );
};
