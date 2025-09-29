import { ComboBox, Option } from "@salt-ds/core";
import {
  type ChangeEvent,
  type ReactElement,
  type SyntheticEvent,
  useState,
} from "react";
import { shortColorData } from "./exampleData";

export const OverlayProps = (): ReactElement => {
  const [value, setValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    _event: SyntheticEvent,
    newSelected: string[],
  ) => {
    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  return (
    <ComboBox
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: "266px" }}
      OverlayProps={{
        style: {
          maxHeight:
            // Show 5 items
            "calc((var(--salt-size-base) + var(--salt-spacing-100)) * 5)",
        },
      }}
    >
      {shortColorData
        .filter((color) =>
          color.toLowerCase().includes(value.trim().toLowerCase()),
        )
        .map((color) => (
          <Option value={color} key={color} />
        ))}
    </ComboBox>
  );
};
