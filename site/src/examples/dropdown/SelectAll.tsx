import { Dropdown, type DropdownProps, Option } from "@salt-ds/core";
import { type ReactElement, useState } from "react";
import { shortColorData } from "./exampleData";

export const SelectAll = (): ReactElement => {
  const [selected, setSelected] = useState<string[]>([]);
  const allSelectedOptionValue = "all";

  const handleSelectionChange: DropdownProps["onSelectionChange"] = (
    event,
    newSelected,
  ) => {
    let newOptionsSelected = [...newSelected];
    const allWasPreviousSelected = selected.includes(allSelectedOptionValue);
    const allIsCurrentlySelected = newOptionsSelected.includes(
      allSelectedOptionValue,
    );

    // If all was unselected
    if (allWasPreviousSelected && !allIsCurrentlySelected) {
      newOptionsSelected = [];
      // If an option was unselected (-1 to not include "all")
    } else if (
      allWasPreviousSelected &&
      newOptionsSelected.length - 1 !== shortColorData.length
    ) {
      newOptionsSelected = newOptionsSelected.filter(
        (el) => el !== allSelectedOptionValue,
      );
      // If all was selected or all options are now selected
    } else if (
      allIsCurrentlySelected ||
      (!allIsCurrentlySelected &&
        newOptionsSelected.length === shortColorData.length)
    ) {
      newOptionsSelected = [allSelectedOptionValue, ...shortColorData];
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
            borderBottom: "var(--salt-borderStyle-solid)",
            borderWidth: "var(--salt-size-fixed-100)",
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
