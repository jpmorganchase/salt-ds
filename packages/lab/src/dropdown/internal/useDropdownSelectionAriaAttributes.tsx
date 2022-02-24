import { AriaAttributes, useMemo } from "react";

// Is single item selected in a multiselect dropdown
function isMultiSelect<T>(selectedItem?: T | T[]): selectedItem is T[] {
  return Array.isArray(selectedItem) && selectedItem.length === 1;
}

/**
 * aria-setsize and aria-posinset attributes to be set on the dropdown button value node when the dropdown is collapsed
 * **/
export function useDropdownSelectionAriaAttributes<T>(
  selectedItem?: T | T[],
  source?: T[]
) {
  return useMemo(() => {
    const ariaAttributes: Pick<
      AriaAttributes,
      "aria-posinset" | "aria-setsize" | "aria-selected"
    > = {
      "aria-setsize": source ? source.length : 0,
      "aria-selected": "true",
    };
    if (source && selectedItem != null && !isMultiSelect(selectedItem)) {
      const selectedIndex = source.indexOf(selectedItem);
      if (selectedIndex !== -1) {
        ariaAttributes["aria-posinset"] = selectedIndex + 1;
      }
    }
    return ariaAttributes;
  }, [selectedItem, source]);
}
