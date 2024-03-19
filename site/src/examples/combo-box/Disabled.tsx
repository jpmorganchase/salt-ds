import { ReactElement } from "react";
import { ComboBox, Option } from "@salt-ds/core";
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
