import { ChangeEvent, ReactElement, useState, SyntheticEvent } from "react";
import { ComboBox, Option } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const SelectAll = (): ReactElement => {
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const allSelectedOptionValue = "all";
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    let newOptionsSelected = [...newSelected];
    const wasAllSelected = selected.includes(allSelectedOptionValue);
    const isAllSelected = newOptionsSelected.includes(allSelectedOptionValue);

    if (wasAllSelected) {
      if (isAllSelected) {
        newOptionsSelected = newOptionsSelected.filter(
          (el) => el !== allSelectedOptionValue
        );
      } else {
        newOptionsSelected = [];
      }
    } else if (
      isAllSelected ||
      (!isAllSelected && newOptionsSelected.length === shortColorData.length)
    ) {
      newOptionsSelected = [...shortColorData, allSelectedOptionValue];
    }
    setSelected(newOptionsSelected);

    setValue("");
  };

  const filteredOptions = shortColorData.filter((data) =>
    data.toLowerCase().includes(value.trim().toLowerCase())
  );

  return (
    <ComboBox
      multiselect
      selected={selected}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: "266px" }}
    >
      {filteredOptions.length > 1 && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 9,
            background: !selected.includes(allSelectedOptionValue)
              ? "var(--salt-color-white)"
              : "",
          }}
        >
          <Option
            style={{
              borderBottom: "solid",
              borderWidth: "1px",
              borderColor:
                selected.includes(filteredOptions[0]) ||
                selected.includes(allSelectedOptionValue)
                  ? "transparent"
                  : "var(--salt-separable-tertiary-borderColor)",
            }}
            value={"all"}
            key={"all"}
          >
            Select All
          </Option>
        </div>
      )}
      {filteredOptions.map((state) => (
        <Option value={state} key={state} />
      ))}
    </ComboBox>
  );
};
