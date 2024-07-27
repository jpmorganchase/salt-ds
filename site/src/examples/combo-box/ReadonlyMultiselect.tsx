import { ComboBox, Option } from "@salt-ds/core";
import { type ReactElement, useState } from "react";
import { shortColorData } from "./exampleData";

export const ReadonlyMultiselect = (): ReactElement => {
  const [selected, setSelected] = useState(["Red", "Green", "Blue"]);

  return (
    <ComboBox
      readOnly
      multiselect
      selected={selected}
      style={{ width: "266px" }}
    >
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </ComboBox>
  );
};
