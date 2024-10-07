import { Children, type ComponentPropsWithoutRef, forwardRef } from "react";
import { OptionList } from "../option/OptionList";
import { useForkRef, useId, useIsomorphicLayoutEffect } from "../utils";
import { useDropdownContext } from "./DropdownContext";

export interface DropdownPopoverProps extends ComponentPropsWithoutRef<"div"> {}

export const DropdownPopover = forwardRef<HTMLDivElement, DropdownPopoverProps>(
  function DropdownPopover(props, ref) {
    const { children, id: idProp, ...rest } = props;

    const {
      openState,
      focusedState,
      readOnly,
      setListId,
      refs,
      elements,
      getFloatingProps,
      getPopoverPosition,
      setFocusVisibleState,
      listRef,
    } = useDropdownContext();

    const id = useId(idProp);

    useIsomorphicLayoutEffect(() => {
      if (id) {
        setListId(id);
      }
    }, [id, setListId]);

    const handleFloating = useForkRef<HTMLDivElement>(
      refs?.setFloating,
      listRef,
    );
    const handleListRef = useForkRef<HTMLDivElement>(ref, handleFloating);

    const handleListMouseOver = () => {
      setFocusVisibleState(false);
    };

    const handleFocusButton = () => {
      if (
        elements?.domReference &&
        elements.domReference instanceof HTMLElement
      ) {
        elements.domReference.focus();
      }
    };

    return (
      <OptionList
        open={
          (openState || focusedState) &&
          !readOnly &&
          Children.count(children) > 0
        }
        {...getFloatingProps({
          onMouseOver: handleListMouseOver,
          onFocus: handleFocusButton,
          onClick: handleFocusButton,
        })}
        {...getPopoverPosition()}
        ref={handleListRef}
        id={id}
        collapsed={!openState}
        {...rest}
      >
        {children}
      </OptionList>
    );
  },
);
