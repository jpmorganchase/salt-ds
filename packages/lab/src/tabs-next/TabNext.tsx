import { Button, makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { CloseIcon } from "@salt-ds/icons";
import { useTabListNext } from "./TabListNextContext";
import tabCss from "./TabNext.css";
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
  /**
   * If `true`, the tab will be closable.
   */
  closable?: boolean;
}

export const TabNext = forwardRef<HTMLDivElement, TabNextProps>(
  function Tab(props, ref): ReactElement<TabNextProps> {
    const {
      "aria-labelledby": ariaLabelledBy,
      children,
      className,
      disabled: disabledProp,
      closable,
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

    const { selected, setSelected } = useTabsNext();

    const { handleClose } = useTabListNext();
    const { registerTab, getPanelId } = useTabsNext();

    const disabled = disabledProp;

    const tabRef = useRef<HTMLButtonElement>(null);
    const id = useId(idProp);

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (!id) return;
      setSelected(event, id);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (id && (event.key === "Enter" || event.key === " ")) {
        setSelected(event, id);
      }
    };

    useEffect(() => {
      if (value && id && tabRef.current) {
        return registerTab({ id, value, element: tabRef.current });
      }
    }, [value, id, registerTab]);

    const closeButtonId = useId();

    const wasMouseDown = useRef(false);
    const [focusVisible, setFocusVisible] = useState(false);
    const [focused, setFocused] = useState(false);

    const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
      onFocus?.(event);
      setFocused(true);

      // @ts-ignore
      if (!wasMouseDown.current && event.target === tabRef.current) {
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

    const handleCloseButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (!id) return;

      handleClose(event, id);
      event.stopPropagation();
    };

    const handleCloseButtonKeyDown = (
      event: KeyboardEvent<HTMLButtonElement>,
    ) => {
      if (!id) return;

      if (event.key === "Enter" || event.key === " ") {
        handleClose(event, id);
        event.stopPropagation();
      }
    };

    const [panelId, setPanelId] = useState<string | undefined>(undefined);
    useLayoutEffect(() => {
      setPanelId(getPanelId(value));
    }, [getPanelId, value]);

    return (
      // biome-ignore lint/a11y/useValidAriaRole: <explanation>
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
        data-overflowitem
        ref={ref}
        onMouseDown={handleMouseDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        role="none"
        {...rest}
      >
        <button
          aria-selected={selected === value}
          aria-disabled={disabled}
          aria-controls={panelId}
          tabIndex={focused || selected === value ? undefined : -1}
          role="tab"
          type="button"
          onClick={!disabled ? handleClick : undefined}
          onKeyDown={!disabled ? handleKeyDown : undefined}
          className={withBaseName("action")}
          id={id}
          ref={tabRef}
        >
          {children}
        </button>
        {closable ? (
          <Button
            aria-label="Close tab"
            id={closeButtonId}
            aria-labelledby={clsx(closeButtonId, id)}
            tabIndex={focused || selected === value ? undefined : -1}
            appearance="transparent"
            sentiment="neutral"
            onClick={handleCloseButtonClick}
            onKeyDown={handleCloseButtonKeyDown}
          >
            <CloseIcon aria-hidden />
          </Button>
        ) : null}
      </div>
    );
  },
);
