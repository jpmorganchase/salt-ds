import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { makePrefixer, useControlled } from "../utils";
import { CollapsibleContext } from "./CollapsibleContext";

export interface CollapsibleProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onToggle"> {
  /**
   * If `true`, the collapsible is open. Use with `onOpenChange` to control it.
   */
  open?: boolean;
  /**
   * If `true`, the collapsible is open initially. Use when the component is uncontrolled.
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

    const [panelId, setPanelId] = useState<string | undefined>(undefined);

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
        panelId,
        setPanelId,
      }),
      [open, setOpen, panelId],
    );

    return (
      <CollapsibleContext.Provider value={contextValue}>
        <div className={clsx(withBaseName(), className)} ref={ref} {...rest} />
      </CollapsibleContext.Provider>
    );
  },
);
