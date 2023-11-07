import {
  ComponentPropsWithoutRef,
  CSSProperties,
  forwardRef,
  SyntheticEvent,
  useMemo,
  useState,
} from "react";
import { MenuContext, useMenuContext } from "./MenuContext";
import { useControlled, useFloatingUI } from "@salt-ds/core";
import { flip, offset, shift, limitShift } from "@floating-ui/react";

export interface MenuProps extends ComponentPropsWithoutRef<"div"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (event: SyntheticEvent, newOpen: boolean) => void;
}

export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
  props,
  ref
) {
  const { children, defaultOpen, open, onOpenChange, ...rest } = props;
  const { submenu } = useMenuContext();

  const [openState, setOpenState] = useControlled({
    controlled: open,
    default: Boolean(defaultOpen),
    name: "ListControl",
    state: "open",
  });

  const setOpen = (event: SyntheticEvent, newOpen: boolean) => {
    setOpenState(newOpen);
    onOpenChange?.(event, newOpen);
  };

  const [activeState, setActiveState] = useState<string | undefined>(undefined);

  const setActive = (id?: string) => {
    if (id) {
      setActiveState(id);
    } else {
      setActiveState(undefined);
    }
  };

  const hasParent = submenu !== undefined;

  const { x, y, strategy, elements, refs } = useFloatingUI({
    open,
    placement: hasParent ? "right-start" : "bottom-start",
    middleware: [offset(0), flip({}), shift({ limiter: limitShift() })],
  });

  const floatingStyles: CSSProperties = useMemo(() => {
    return (
      elements.floating ? { position: strategy, top: y, left: x } : {}
    ) as CSSProperties;
  }, [elements.floating, strategy, x, y]);

  return (
    <MenuContext.Provider
      value={{
        openState,
        setOpen,
        floatingStyles,
        refs,
        submenu: hasParent,
        activeState,
        setActive,
      }}
    >
      <div ref={ref} {...rest}>
        {children}
      </div>
    </MenuContext.Provider>
  );
});
