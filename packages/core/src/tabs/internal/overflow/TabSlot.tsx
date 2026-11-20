import { type ComponentPropsWithoutRef, useCallback } from "react";
import { useTabSlotRegistry } from "../contexts/TabSlotRegistryContext";

export interface TabSlotProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The ID that the slot registers with the `TabList`, which moves each tab
   * into the slot whose ID it assigns to the tab: `"main:"`, `"overflow:"` or
   * `"measure:"` followed by the tab's value, for the tab list, the overflow
   * menu or the hidden container that measures overflowing tabs.
   */
  slotId: string;
  /**
   * The value of the tab that the slot holds, set as the slot's `data-value`
   * attribute.
   */
  value: string;
}

export function TabSlot({ slotId, value, ...rest }: TabSlotProps) {
  const slotRegistry = useTabSlotRegistry();
  const handleRef = useCallback(
    (element: HTMLDivElement | null) => {
      slotRegistry?.registerSlot(slotId, element);
    },
    [slotId, slotRegistry],
  );

  return (
    <div
      role="presentation"
      data-tabslot=""
      data-slotid={slotId}
      data-value={value}
      ref={handleRef}
      style={{ display: "contents" }}
      {...rest}
    />
  );
}
