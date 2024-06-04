import { ReactElement, useState } from "react";
import { Dropdown, Option, DropdownProps } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const SelectAll = (): ReactElement => {
  const [selected, setSelected] = useState<string[]>([]);
  const allSelectedOptionValue = "all";

  const handleSelectionChange: DropdownProps["onSelectionChange"] = (
    event,
    newSelected
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
  };

  return (
    <Dropdown
      style={{ width: "266px" }}
      selected={selected}
      value={
        selected.length < 2
          ? selected[0]
          : selected.includes("all")
          ? "All Selected"
          : `${selected.length} items selected`
      }
      onSelectionChange={handleSelectionChange}
      multiselect
    >
      <div>
        <Option
          style={{
            borderBottom: "var(--salt-separable-borderStyle)",
            borderWidth: "var(--salt-size-border)",
            borderColor:
              selected.includes(shortColorData[0]) ||
              selected.includes(allSelectedOptionValue)
                ? "transparent"
                : "var(--salt-separable-tertiary-borderColor)",
          }}
          value={allSelectedOptionValue}
        >
          Select All
        </Option>
      </div>
      {shortColorData.map((state) => (
        <Option value={state} key={state} />
      ))}
    </Dropdown>
  );
};
