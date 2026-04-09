import {
  makePrefixer,
  useForkRef,
  useId,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
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
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import tabCss from "./TabNext.css";
import { TabNextContext } from "./TabNextContext";
import { useTabsNext } from "./TabsNextContext";
import { getMeasuredWidth } from "./widthMeasurement";

const withBaseName = makePrefixer("saltTabNext");

export interface TabNextProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * If `true`, the tab will be disabled.
   */
  disabled?: boolean;
  /**
   * The value of the tab. This must be unique within a `TabsNext` instance.
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

    const { selected, activeTab, registerRenderedTab, updateRenderedTab } =
      useTabsNext();

    const disabled = !!disabledProp;

    const id = useId(idProp);

    const wasMouseDown = useRef(false);
    const [focusVisible, setFocusVisible] = useState(false);
    const [focused, setFocused] = useState(false);
    const markerRef = useRef<HTMLSpanElement>(null);
    const tabRootRef = useRef<HTMLDivElement>(null);
    const hostRef = useRef<HTMLDivElement | null>(null);

    if (!hostRef.current && targetWindow?.document) {
      hostRef.current = targetWindow.document.createElement("div");
      hostRef.current.dataset.tabHost = value;
      hostRef.current.style.display = "contents";
    }

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
      if (value && id) {
        activeTab.current = { value, id };
      }
      wasMouseDown.current = true;
    };

    const [actionIds, setActionIds] = useState(() => new Set<string>());

    const registerAction = useCallback((id: string) => {
      setActionIds((old) => {
        if (old.has(id)) {
          return old;
        }

        const next = new Set(old);
        next.add(id);
        return next;
      });

      return () => {
        setActionIds((old) => {
          if (!old.has(id)) {
            return old;
          }

          const next = new Set(old);
          next.delete(id);
          return next;
        });
      };
    }, []);

    const actions = useMemo(() => Array.from(actionIds), [actionIds]);

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

    useIsomorphicLayoutEffect(() => {
      if (!hostRef.current || !id) {
        return;
      }

      return registerRenderedTab({
        host: hostRef.current,
        id,
        marker: markerRef.current,
        root: tabRootRef.current,
        trigger: null,
        value,
        width: 0,
      });
    }, [id, registerRenderedTab, value]);

    useIsomorphicLayoutEffect(() => {
      updateRenderedTab(value, {
        marker: markerRef.current,
        root: tabRootRef.current,
      });
    }, [updateRenderedTab, value]);

    useEffect(() => {
      const element = tabRootRef.current;
      const resizeObserverCtor = (
        targetWindow as
          | (Window & { ResizeObserver?: typeof ResizeObserver })
          | undefined
      )?.ResizeObserver;
      if (!element || !resizeObserverCtor) {
        return;
      }

      const updateWidth = () => {
        // Preserve the strip width while a tab is rendered in the overflow menu.
        // Overflow items stretch to the menu width, and hidden measurement tabs
        // can collapse to a different intrinsic size. Neither width is suitable
        // for deciding whether the tab fits back in the main strip.
        if (
          element.closest(".saltTabOverflow-list") ||
          element.closest(".saltTabListNext-measureContainer")
        ) {
          return;
        }

        updateRenderedTab(value, {
          width: getMeasuredWidth(element),
        });
      };

      updateWidth();

      const observer = new resizeObserverCtor(() => {
        updateWidth();
      });

      observer.observe(element);
      return () => {
        observer.disconnect();
      };
    }, [targetWindow, updateRenderedTab, value]);

    const handleTabRootRef = useForkRef(tabRootRef, ref);

    const tabMarkup = (
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
          data-value={value}
          ref={handleTabRootRef}
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

    return (
      <>
        <span data-tabnext-marker="" hidden ref={markerRef} />
        {hostRef.current ? createPortal(tabMarkup, hostRef.current) : null}
      </>
    );
  },
);
