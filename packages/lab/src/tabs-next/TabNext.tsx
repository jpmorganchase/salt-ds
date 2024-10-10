import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  forwardRef,
  useMemo,
  useRef,
  useState,
} from "react";

import tabCss from "./TabNext.css";
import { TabNextContext } from "./TabNextContext";
import { useTabsNext } from "./TabsNextContext";

const withBaseName = makePrefixer("saltTabNext");

export interface TabNextProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * If `true`, the tab will be disabled.
   */
  disabled?: boolean;
  /**
   * The value of the tab.
   */
  value: string;
}

export const TabNext = forwardRef<HTMLDivElement, TabNextProps>(
  function Tab(props, ref): ReactElement<TabNextProps> {
    const {
      "aria-labelledby": ariaLabelledBy,
      children,
      className,
      disabled: disabledProp,
      onBlur,
      onMouseDown,
      onFocus,
      value,
      id: idProp,
      ...rest
    } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tab-next",
      css: tabCss,
      window: targetWindow,
    });

    const { selected, activeTab } = useTabsNext();

    const disabled = !!disabledProp;

    const id = useId(idProp);

    const wasMouseDown = useRef(false);
    const [focusVisible, setFocusVisible] = useState(false);
    const [focused, setFocused] = useState(false);

    const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
      onFocus?.(event);

      if (value && id) {
        activeTab.current = { value, id };
      }

      setFocused(true);

      if (
        !wasMouseDown.current &&
        event.target.getAttribute("role") === "tab"
      ) {
        setFocusVisible(true);
      }

      wasMouseDown.current = false;
    };

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
      onBlur?.(event);
      setFocused(false);
      setFocusVisible(false);
    };

    const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
      onMouseDown?.(event);
      wasMouseDown.current = true;
    };

    const context = useMemo(
      () => ({
        tabId: id,
        selected: selected === value,
        focused,
        value,
        disabled,
      }),
      [id, selected, value, focused, disabled],
    );

    return (
      <TabNextContext.Provider value={context}>
        <div
          className={clsx(
            withBaseName(),
            {
              [withBaseName("selected")]: selected === value,
              [withBaseName("disabled")]: disabled,
              [withBaseName("focusVisible")]: focusVisible,
            },
            className,
          )}
          data-overflowitem="true"
          ref={ref}
          onMouseDown={handleMouseDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          role="presentation"
          {...rest}
        >
          {children}
        </div>
      </TabNextContext.Provider>
    );
  },
);
