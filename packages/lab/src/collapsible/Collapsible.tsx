import { makePrefixer, useControlled } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type SyntheticEvent,
  useCallback,
  useMemo,
} from "react";
import { CollapsibleContext } from "./CollapsibleContext";

export interface CollapsibleProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onToggle"> {
  /**
   * Whether the accordion is open.
   */
  open?: boolean;
  /**
   * Whether the accordion is open by default.
   */
  defaultOpen?: boolean;
  /**
   * Callback fired when the accordion is opened or closed.
   */
  onOpenChange?: (
    event: SyntheticEvent<HTMLButtonElement>,
    open: boolean,
  ) => void;
}

const withBaseName = makePrefixer("saltCollapsible");

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  function Collapsible(props, ref) {
    const {
      className,
      open: openProp,
      defaultOpen,
      onOpenChange,
      ...rest
    } = props;

    const [open, setOpenState] = useControlled({
      default: Boolean(defaultOpen),
      controlled: openProp,
      name: "Collapsible",
      state: "open",
    });

    const setOpen = useCallback(
      (event: SyntheticEvent<HTMLButtonElement>, newOpen: boolean) => {
        setOpenState(newOpen);
        onOpenChange?.(event, newOpen);
      },
      [onOpenChange],
    );

    const contextValue = useMemo(
      () => ({
        open,
        setOpen,
      }),
      [open, setOpen],
    );

    return (
      <CollapsibleContext.Provider value={contextValue}>
        <div className={clsx(withBaseName(), className)} ref={ref} {...rest} />
      </CollapsibleContext.Provider>
    );
  },
);
