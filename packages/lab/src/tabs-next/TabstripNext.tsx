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
  disabled?: boolean;
  /* Value for the uncontrolled version. */
  selected?: string;
  /* Callback for the controlled version. */
  onChange?: (e: SyntheticEvent) => void;
  /* Initial value for the uncontrolled version. */
  defaultSelected?: string;
}

type TabValue = {
  value: string;
  label: ReactNode;
};

export const TabstripNext = forwardRef<HTMLDivElement, TabstripNextProps>(
  function TabstripNext(props, ref) {
    const {
      children,
      className,
      disabled,
      selected: selectedProp,
      defaultSelected,
      onChange,
      onKeyDown,
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

    const [selected, setSelected] = useControlled({
      controlled: selectedProp,
      default: defaultSelected,
      name: "TabstripNext",
      state: "selected",
    });
    const [focused, setFocused] = useState<string | undefined>(selected);
    const [overflowOpen, setOverflowOpen] = useState(false);

    const select = useCallback(
      (event: SyntheticEvent<HTMLButtonElement>) => {
        const newValue = event.currentTarget.value;
        setSelected(newValue);
        if (selected !== newValue) {
          onChange?.(event);
        }
      },
      [onChange, selected, setSelected]
    );

    const isSelected = useCallback(
      (id: string | undefined) => {
        return selected === id;
      },
      [selected]
    );

    const focus = useCallback((id: string | undefined) => {
      setFocused(id);
    }, []);

    const isFocused = useCallback(
      (id: string | undefined) => {
        return focused === id || !focused;
      },
      [focused]
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
        (element) => element === document.activeElement
      );

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
        setSelected(item.value);
        queueMicrotask(() => {
          const element = tabstripRef.current?.querySelector(
            `[value="${item.value}"]`
          );
          if (element instanceof HTMLElement) {
            element?.focus();
          }
        });
        if (selected !== item.value) {
          onChange?.(event);
        }
      }
    };

    const handleOverflowOpenChange = (isOpen: boolean) => {
      setOverflowOpen(isOpen);
    };

    const value = useMemo(
      () => ({
        select,
        isSelected,
        focus,
        isFocused,
        registerTab,
        unregisterTab,
      }),
      [select, isSelected, focus, isFocused, registerTab, unregisterTab]
    );

    return (
      <TabsContext.Provider value={value}>
        <Overflow ref={handleRef}>
          <div
            role="tablist"
            className={clsx(withBaseName(), withBaseName("horizontal"))}
            onKeyDown={handleKeyDown}
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
