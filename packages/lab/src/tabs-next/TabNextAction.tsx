import {
  Button,
  type ButtonProps,
  useId,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { type FocusEvent, forwardRef, type MouseEvent } from "react";
import { useTabNext } from "./TabNextContext";
import { useTabsNext } from "./TabsNextContext";

export interface TabNextActionProps extends ButtonProps {}

export const TabNextAction = forwardRef<HTMLButtonElement, TabNextActionProps>(
  function TabNextAction(props, ref) {
    const {
      "aria-labelledby": ariaLabelledBy,
      id: idProp,
      onFocus,
      onMouseDown,
      ...rest
    } = props;

    const id = useId(idProp);
    const { focused, selected, tabId, registerAction, value } = useTabNext();
    const { activeTab } = useTabsNext();

    useIsomorphicLayoutEffect(() => {
      if (id) {
        return registerAction(id);
      }
    }, [registerAction, id]);

    const setActiveTab = () => {
      if (tabId && value) {
        activeTab.current = { id: tabId, value };
      }
    };

    const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
      onFocus?.(event);
      setActiveTab();
    };

    const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
      onMouseDown?.(event);
      setActiveTab();
    };

    return (
      <Button
        id={id}
        aria-labelledby={clsx(ariaLabelledBy, tabId, id)}
        tabIndex={focused || selected ? undefined : -1}
        appearance="transparent"
        sentiment="neutral"
        ref={ref}
        onFocus={handleFocus}
        onMouseDown={handleMouseDown}
        {...rest}
      />
    );
  },
);
