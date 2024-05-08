import { ReactElement, useState } from "react";
import { Dropdown, Option, DropdownProps } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const SelectAll = (): ReactElement => {
  const [selected, setSelected] = useState<string[]>([]);
  const allSelectedOptionValue = 'all'

  const handleSelectionChange: DropdownProps["onSelectionChange"] = (
    event,
    newSelected
  ) => {

    let newOptionsSelected = [...newSelected];

    //case: clear all if select all is unselected
    if (selected.includes(allSelectedOptionValue) && newOptionsSelected.includes(allSelectedOptionValue)) {
      newOptionsSelected = newOptionsSelected.filter(el => el !== allSelectedOptionValue);
      if (newOptionsSelected.length === shortColorData.length) {
        newOptionsSelected = [];
      }
    }
    //case: clear all if select all is unselected
    else if (selected.includes(allSelectedOptionValue) && !newOptionsSelected.includes(allSelectedOptionValue)) {
      newOptionsSelected = [];
    }
    //case: select all if select all is selected
    else if (!selected.includes(allSelectedOptionValue) && newOptionsSelected.includes(allSelectedOptionValue)) {
      newOptionsSelected = [...shortColorData, allSelectedOptionValue]
    }
    //case: select all should be checked if all options are selected
    else if (!newOptionsSelected.includes(allSelectedOptionValue) && newOptionsSelected.length === shortColorData.length) {
      newOptionsSelected = [...shortColorData, allSelectedOptionValue]
    }

    setSelected(newOptionsSelected);

  };

  return (
    <Dropdown
      style={{ width: "266px" }}
      selected={selected}
      value={
        selected.length < 2 ? selected[0] : selected.includes('all') ? 'All Selected' : `${selected.length} items selected`
      }
      onSelectionChange={handleSelectionChange}
      multiselect
    >
      <Option
        style={{
          borderBottom: "solid",
          borderWidth: "1px",
          borderColor: "var(--salt-separable-tertiary-borderColor)"
        }}
        value={allSelectedOptionValue} key={allSelectedOptionValue} >Select All</Option>
      {shortColorData.map((state) => (
        <Option value={state} key={state} />
      ))}
    </Dropdown>
  );
};
