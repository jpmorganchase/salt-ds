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
import tabCss from "./TabNext.css";
import { useTabsNext } from "./TabsNextContext";
import { useTabstripNext } from "./TabstripNextContext";

const withBaseName = makePrefixer("saltTabNext");

export interface TabNextProps extends ComponentPropsWithoutRef<"div"> {
  /* Value prop is mandatory and must be unique in order for overflow to work. */
  disabled?: boolean;
  value: string;
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
      onClick,
      onKeyDown,
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
    const {
      registerItem,
      variant,
      setSelected,
      setActive,
      selected,
      focusInside,
      handleClose,
    } = useTabstripNext();
    const { registerTab, getPanelId } = useTabsNext();

    const disabled = disabledProp;

    const tabRef = useRef<HTMLButtonElement>(null);
    const id = useId(idProp);

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      setSelected(event, value);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);

      if (event.key === "Enter" || event.key === " ") {
        setSelected(event, value);
      }
    };

    useEffect(() => {
      if (value && tabRef.current) {
        return registerItem({ id: value, element: tabRef.current });
      }
    }, [value, registerItem]);

    useEffect(() => {
      if (value && id) {
        return registerTab(id, value);
      }
    }, [value, id, registerTab]);

    const closeButtonId = useId();
    const labelId = useId();

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

      setActive(value);
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
      handleClose(event, value);
      event.stopPropagation();
    };

    const handleCloseButtonKeyDown = (
      event: KeyboardEvent<HTMLButtonElement>,
    ) => {
      if (event.key === "Enter" || event.key === " ") {
        handleClose(event, value);
        event.stopPropagation();
      }
    };

    const [panelId, setPanelId] = useState<string | undefined>(undefined);
    useLayoutEffect(() => {
      setPanelId(getPanelId(value));
    }, [getPanelId, value]);

    return (
      <div
        className={clsx(
          withBaseName(),
          withBaseName(variant),
          {
            [withBaseName("selected")]: selected === value,
            [withBaseName("disabled")]: disabled,
            [withBaseName("focusVisible")]: focusVisible,
          },
          className,
        )}
        data-value={value}
        data-overflowitem
        ref={ref}
        onClick={!disabled ? handleClick : undefined}
        onKeyDown={!disabled ? handleKeyDown : undefined}
        onMouseDown={handleMouseDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      >
        <button
          aria-selected={selected === value}
          aria-disabled={disabled}
          aria-controls={panelId}
          tabIndex={
            (focusInside && focused) || (selected === value && !focusInside)
              ? 0
              : -1
          }
          role="tab"
          type="button"
          className={withBaseName("action")}
          id={labelId}
          ref={tabRef}
        >
          {children}
        </button>
        {closable ? (
          <Button
            aria-label="Dismiss tab"
            id={closeButtonId}
            aria-labelledby={clsx(closeButtonId, labelId)}
            tabIndex={focused || (!focusInside && selected === value) ? 0 : -1}
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
