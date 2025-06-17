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
   * Whether the accordion is expanded.
   */
  expanded?: boolean;
  /**
   * Whether the accordion is expanded by default.
   */
  defaultExpanded?: boolean;
  /**
   * Callback fired when the accordion is toggled.
   */
  onToggle?: (
    event: SyntheticEvent<HTMLButtonElement>,
    expanded: boolean,
  ) => void;
}

const withBaseName = makePrefixer("saltCollapsible");

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  function Collapsible(props, ref) {
    const {
      className,
      expanded: expandedProp,
      defaultExpanded,
      onToggle,
      ...rest
    } = props;

    const [expanded, setExpandedState] = useControlled({
      default: Boolean(defaultExpanded),
      controlled: expandedProp,
      name: "Collapsible",
      state: "expanded",
    });

    const setExpanded = useCallback(
      (event: SyntheticEvent<HTMLButtonElement>, newExpanded: boolean) => {
        setExpandedState(newExpanded);
        onToggle?.(event, newExpanded);
      },
      [onToggle],
    );

    const contextValue = useMemo(
      () => ({
        expanded,
        setExpanded,
      }),
      [expanded, setExpanded],
    );

    return (
      <CollapsibleContext.Provider value={contextValue}>
        <div className={clsx(withBaseName(), className)} ref={ref} {...rest} />
      </CollapsibleContext.Provider>
    );
  },
);
