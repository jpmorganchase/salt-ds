import { ForwardedRef, HTMLAttributes, forwardRef, useRef } from "react";
import { makePrefixer, Button } from "@brandname/core";
import { OverflowMenuIcon } from "@brandname/icons";

import { useForkRef } from "../../utils";
import { useOverflowDropdown } from "./useOverflowDropdown";
import { OverflowLayoutPanel } from "./OverflowLayoutPanel";

import { Popper, PopperProps, usePopperListAdapter } from "../../popper";

export interface OverflowDropdownProps extends HTMLAttributes<HTMLDivElement> {}

const withBaseName = makePrefixer("uitkOverflowDropdown");

export const OverflowDropdown = forwardRef(function OverflowDropdown(
  { children }: OverflowDropdownProps,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const overflowPanelRef = useRef<HTMLDivElement>(null);
  const { isOpen, setOpen, triggerProps } = useOverflowDropdown({
    dropdownRef: overflowPanelRef,
  });
  const [reference, floating, popperPosition, maxListHeight] =
    usePopperListAdapter(isOpen);

  return (
    <div className={withBaseName()} ref={useForkRef(forwardedRef, rootRef)}>
      <Button {...triggerProps}>
        <OverflowMenuIcon />
      </Button>
      {rootRef.current ? (
        <Popper
          anchorEl={rootRef.current}
          open={isOpen}
          placement={popperPosition}
          role={undefined}
          style={{
            maxHeight: maxListHeight ?? "",
          }}
          ref={floating}
          // {...PopperProps}
        >
          <OverflowLayoutPanel ref={overflowPanelRef}>
            {children}
          </OverflowLayoutPanel>
        </Popper>
      ) : null}
    </div>
  );
});
