import { ChangeEvent, ReactElement, SyntheticEvent, useState } from "react";
import cslx from "clsx";
import { ComboBoxNext, Option } from "@salt-ds/lab";
import { shortColorData } from "./exampleData";
import styles from "./index.module.css";

export const EmptyMessage = (): ReactElement => {
  const [value, setValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  const filteredOptions = shortColorData.filter((color) =>
    color.toLowerCase().includes(value.trim().toLowerCase())
  );

  return (
    <ComboBoxNext
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: "266px" }}
    >
      {filteredOptions.length > 0 ? (
        filteredOptions.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))
      ) : (
        <div
          className={styles.statusOption}
          role="option"
          aria-selected="false"
        >
          No results found for &quot;{value}&quot;
        </div>
      )}
    </ComboBoxNext>
  );
};
