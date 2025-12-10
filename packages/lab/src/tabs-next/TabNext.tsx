import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  forwardRef,
  type MouseEvent,
  type ReactElement,
  useCallback,
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
      children,
      className,
      disabled: disabledProp,
      onBlur,
      onMouseDown,
      onFocus,
      onFocusCapture,
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

    const id = value;

    const wasMouseDown = useRef(false);
    const [focusVisible, setFocusVisible] = useState(false);
    const [focused, setFocused] = useState(false);

    const handleFocusCapture = (event: FocusEvent<HTMLDivElement>) => {
      onFocusCapture?.(event);
      if (value && id) {
        activeTab.current = { value, id };
      }
    };

    const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
      onFocus?.(event);

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

    const [actions, setActions] = useState<string[]>([]);

    const registerAction = useCallback((id: string) => {
      setActions((old) => old.concat(id));

      return () => {
        setActions((old) => old.filter((action) => action !== id));
      };
    }, []);

    const context = useMemo(
      () => ({
        tabId: id,
        selected: selected === value,
        focused,
        value,
        disabled,
        actions,
        registerAction,
      }),
      [id, selected, value, focused, disabled, actions, registerAction],
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
          onFocusCapture={handleFocusCapture}
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
