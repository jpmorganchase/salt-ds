import {
  flip,
  limitShift,
  shift,
  size,
} from "@floating-ui/react-dom-interactions";
import {
  Button,
  isDesktop,
  makePrefixer,
  Portal,
  useFloatingUI,
  useForkRef,
  useWindow,
} from "@jpmorganchase/uitk-core";
import { OverflowMenuIcon } from "@jpmorganchase/uitk-icons";
import {
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  useRef,
  useState,
} from "react";

import { OverflowLayoutPanel } from "./OverflowLayoutPanel";
import { useOverflowDropdown } from "./useOverflowDropdown";

export type OverflowDropdownProps = HTMLAttributes<HTMLDivElement>;

const withBaseName = makePrefixer("uitkOverflowDropdown");

export const OverflowDropdown = forwardRef(function OverflowDropdown(
  { children }: OverflowDropdownProps,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  const overflowPanelRef = useRef<HTMLDivElement>(null);
  const { isOpen, triggerProps } = useOverflowDropdown({
    dropdownRef: overflowPanelRef,
  });

  const [maxListHeight, setMaxListHeight] = useState<number | undefined>(
    undefined
  );
  const middleware = isDesktop
    ? []
    : [
        flip({
          fallbackPlacements: ["bottom-start", "top-start"],
        }),
        shift({ limiter: limitShift() }),
        size({
          apply({ availableHeight }) {
            setMaxListHeight(availableHeight);
          },
        }),
      ];
  const { reference, floating, x, y, strategy } = useFloatingUI({
    placement: "bottom-start",
    middleware: middleware,
  });
  const Window = useWindow();
  const handleRef = useForkRef<HTMLDivElement>(forwardedRef, reference);

  return (
    <div className={withBaseName()} ref={handleRef}>
      <Button {...triggerProps}>
        <OverflowMenuIcon />
      </Button>
      {isOpen ? (
        <Portal>
          <Window
            style={{
              top: y ?? "",
              left: x ?? "",
              position: strategy,
              maxHeight: maxListHeight ?? "",
            }}
            ref={floating}
          >
            <OverflowLayoutPanel ref={overflowPanelRef}>
              {children}
            </OverflowLayoutPanel>
          </Window>
        </Portal>
      ) : null}
    </div>
  );
});
