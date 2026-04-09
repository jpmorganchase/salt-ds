import { type ComponentPropsWithoutRef, useCallback } from "react";
import { useTabSlotRegistry } from "./TabSlotRegistryContext";

export interface TabSlotProps extends ComponentPropsWithoutRef<"div"> {
  slotId: string;
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
      data-tabslot=""
      data-slotid={slotId}
      data-value={value}
      ref={handleRef}
      style={{ display: "contents" }}
      {...rest}
    />
  );
}
