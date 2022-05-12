import {
  ForwardedRef,
  HTMLAttributes,
  forwardRef,
  useRef,
  useState,
} from "react";
import { makePrefixer, Button } from "@jpmorganchase/uitk-core";
import { OverflowMenuIcon } from "@jpmorganchase/uitk-icons";

import { useForkRef } from "../../utils";
import { useOverflowDropdown } from "./useOverflowDropdown";
import { OverflowLayoutPanel } from "./OverflowLayoutPanel";

import { useFloatingUI } from "../../popper";
import { isDesktop, useWindow } from "../../window";
import { Portal } from "../../portal";
import {
  flip,
  limitShift,
  shift,
  size,
} from "@floating-ui/react-dom-interactions";

export interface OverflowDropdownProps extends HTMLAttributes<HTMLDivElement> {}

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
          apply({ height }) {
            setMaxListHeight(height);
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
