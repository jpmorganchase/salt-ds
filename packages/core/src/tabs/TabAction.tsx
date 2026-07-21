import { clsx } from "clsx";
import { type FocusEvent, forwardRef, type MouseEvent } from "react";
import { Button, type ButtonProps } from "../button";
import { useId, useIsomorphicLayoutEffect } from "../utils";
import { useTab } from "./internal/contexts/TabContext";
import { useTabs } from "./internal/contexts/TabsContext";

export interface TabActionProps extends ButtonProps {}

export const TabAction = forwardRef<HTMLButtonElement, TabActionProps>(
  function TabAction(props, ref) {
    const {
      "aria-labelledby": ariaLabelledBy,
      id: idProp,
      onFocus,
      onMouseDown,
      ...rest
    } = props;

    const id = useId(idProp);
    const { focused, selected, tabId, registerAction, value } = useTab();
    const { activeTab } = useTabs();

    useIsomorphicLayoutEffect(() => {
      if (id) {
        return registerAction(id);
      }
    }, [registerAction, id]);

    const setActiveTab = () => {
      if (tabId) {
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
