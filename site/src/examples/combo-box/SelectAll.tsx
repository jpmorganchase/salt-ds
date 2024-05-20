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
    //case: if select all is previously selected but any option is unselected, then unselect the select all checkbox
    if (
      selected.includes(allSelectedOptionValue) &&
      newOptionsSelected.includes(allSelectedOptionValue)
    ) {
      newOptionsSelected = newOptionsSelected.filter(
        (el) => el !== allSelectedOptionValue
      );
    }
    //case: clear all if select all is unselected
    else if (
      selected.includes(allSelectedOptionValue) &&
      !newOptionsSelected.includes(allSelectedOptionValue)
    ) {
      newOptionsSelected = [];
    }
    //case: select all if select all is selected
    else if (
      !selected.includes(allSelectedOptionValue) &&
      newOptionsSelected.includes(allSelectedOptionValue)
    ) {
      newOptionsSelected = [...shortColorData, allSelectedOptionValue];
    }
    //case: select all should be checked if all options are selected
    else if (
      !newOptionsSelected.includes(allSelectedOptionValue) &&
      newOptionsSelected.length === shortColorData.length
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
