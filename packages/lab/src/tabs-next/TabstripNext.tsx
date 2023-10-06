import { makePrefixer, useControlled, useForkRef } from "@salt-ds/core";
import clsx from "clsx";
import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactNode,
  SyntheticEvent,
  KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { Overflow } from "@fluentui/react-overflow";
import { OverflowMenu } from "./OverflowMenu";
import tabstripCss from "./TabstripNext.css";
import { TabsContext } from "./TabNextContext";
import { SelectionChangeHandler } from "../common-hooks";

const withBaseName = makePrefixer("saltTabstripNext");

export interface TabstripNextProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /* Styling active color variant. Defaults to "primary". */
  activeColor?: "primary" | "secondary";
  /* Tabs alignment. Defaults to "center" */
  align?: "left" | "center" | "right";
  /* Value for the uncontrolled version. */
  value?: string;
  /* Callback for the controlled version. */
  onChange?: (e: SyntheticEvent, data: { value: string }) => void;
  /* Initial value for the uncontrolled version. */
  defaultValue?: string;
  /* The Tabs variant */
  variant?: "main" | "inline";
}

interface TabValue {
  value: string;
  label: ReactNode;
}

export const TabstripNext = forwardRef<HTMLDivElement, TabstripNextProps>(
  function TabstripNext(props, ref) {
    const {
      activeColor = "primary",
      align = "center",
      children,
      className,
      value: valueProp,
      defaultValue,
      onChange,
      onKeyDown,
      style,
      variant = "main",
      ...rest
    } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tabstrip-next",
      css: tabstripCss,
      window: targetWindow,
    });

    const tabstripRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(tabstripRef, ref);

    const [value, setValue] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: "TabstripNext",
      state: "selected",
    });
    const [focusable, setFocusableState] = useState<string | undefined>(value);
    const [overflowOpen, setOverflowOpen] = useState(false);

    const activate = useCallback(
      (event: SyntheticEvent<HTMLButtonElement>) => {
        const newValue = event.currentTarget.value;
        setValue(newValue);
        if (value !== newValue) {
          onChange?.(event, { value: newValue });
        }
      },
      [onChange, value, setValue]
    );

    const isActive = useCallback(
      (id: string | undefined) => {
        return value === id;
      },
      [value]
    );

    const setFocusable = useCallback((id: string | undefined) => {
      setFocusableState(id);
    }, []);

    const isFocusable = useCallback(
      (id: string | undefined) => {
        return focusable === id || !focusable;
      },
      [focusable]
    );

    const [tabList, setTabList] = useState<TabValue[]>([]);
    const registerTab = useCallback((tab: TabValue) => {
      setTabList((list) => list.concat([tab]));
    }, []);

    const unregisterTab = useCallback((id: string) => {
      setTabList((list) => list.filter((item) => item.value !== id));
    }, []);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (overflowOpen) return;

      const elements: HTMLElement[] = Array.from(
        tabstripRef.current?.querySelectorAll(
          `div:not([data-overflowing]) > [role="tab"]:not([disabled])`
        ) ?? []
      );

      const currentIndex = elements.findIndex(
        (element) => element === targetWindow?.document.activeElement
      );

      if (currentIndex < 0) return;

      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          elements[Math.min(currentIndex + 1, elements.length)]?.focus();
          break;
        case "ArrowUp":
        case "ArrowLeft":
          elements[Math.max(0, currentIndex - 1)]?.focus();
          break;
        case "Home":
          elements[0]?.focus();
          break;
        case "End":
          elements[elements.length - 1]?.focus();
      }

      onKeyDown?.(event);
    };

    const handleOverflowItemClick: SelectionChangeHandler<TabValue> = (
      event,
      item
    ) => {
      if (item) {
        setValue(item.value);
        requestAnimationFrame(() => {
          const element = tabstripRef.current?.querySelector(
            `[value="${item.value}"]`
          );
          if (element instanceof HTMLElement) {
            element?.focus();
          }
        });
        if (value !== item.value) {
          onChange?.(event, { value: item.value });
        }
      }
    };

    const handleOverflowOpenChange = (isOpen: boolean) => {
      setOverflowOpen(isOpen);
    };

    const contextValue = useMemo(
      () => ({
        activate,
        isActive,
        setFocusable,
        isFocusable,
        registerTab,
        unregisterTab,
        variant,
        activeColor,
      }),
      [
        activate,
        isActive,
        setFocusable,
        isFocusable,
        registerTab,
        unregisterTab,
        variant,
        activeColor,
      ]
    );

    const tabstripStyle = {
      "--tabstripnext-justifyContent": align,
      ...style,
    };

    return (
      <TabsContext.Provider value={contextValue}>
        <Overflow ref={handleRef}>
          <div
            role="tablist"
            className={clsx(
              withBaseName(),
              withBaseName("horizontal"),
              withBaseName(variant),
              className
            )}
            onKeyDown={handleKeyDown}
            style={tabstripStyle}
            {...rest}
          >
            {children}
            <OverflowMenu
              tabs={tabList}
              onOpenChange={handleOverflowOpenChange}
              onSelectionChange={handleOverflowItemClick}
            />
          </div>
        </Overflow>
      </TabsContext.Provider>
    );
  }
);
