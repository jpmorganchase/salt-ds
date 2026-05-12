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
import { createPortal } from "react-dom";
import {
  makePrefixer,
  useForkRef,
  useId,
  useIsomorphicLayoutEffect,
} from "../utils";
import { TabContext } from "./internal/contexts/TabContext";
import { useTabs } from "./internal/contexts/TabsContext";
import { useRenderedTabWidth } from "./internal/overflow/useRenderedTabWidth";
import { getIntrinsicMeasuredWidth } from "./internal/overflow/widthMeasurement";
import tabCss from "./Tab.css";

const withBaseName = makePrefixer("saltTab");

export interface TabProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * If `true`, the tab will be disabled.
   */
  disabled?: boolean;
  /**
   * The value of the tab. This must be unique within a `Tabs` instance.
   */
  value: string;
}

export const Tab = forwardRef<HTMLDivElement, TabProps>(
  function Tab(props, ref): ReactElement<TabProps> {
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
      testId: "salt-tab",
      css: tabCss,
      window: targetWindow,
    });

    const {
      selected,
      activeTab,
      renderMode,
      registerBootstrapTab,
      setBootstrapTabReady,
      registerRenderedTab,
      updateRenderedTab,
    } = useTabs();

    const disabled = !!disabledProp;

    const id = useId(idProp);

    const wasMouseDown = useRef(false);
    const [focusVisible, setFocusVisible] = useState(false);
    const [focused, setFocused] = useState(false);
    const [hostElement, setHostElement] = useState<HTMLDivElement | null>(null);
    const markerRef = useRef<HTMLSpanElement>(null);
    const tabRootRef = useRef<HTMLDivElement>(null);

    const handleFocusCapture = (event: FocusEvent<HTMLDivElement>) => {
      onFocusCapture?.(event);
      if (id) {
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
      if (id) {
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
      const doc = targetWindow?.document;
      if (!doc) {
        return;
      }

      const host = doc.createElement("div");
      host.dataset.tabHost = value;
      host.role = "presentation";
      host.style.display = "contents";
      setHostElement(host);

      return () => {
        host.remove();
      };
    }, [targetWindow, value]);

    useIsomorphicLayoutEffect(() => {
      if (renderMode !== "inline") {
        return;
      }

      return registerBootstrapTab(value);
    }, [registerBootstrapTab, renderMode, value]);

    useIsomorphicLayoutEffect(() => {
      setBootstrapTabReady(value, hostElement != null);

      return () => {
        setBootstrapTabReady(value, false);
      };
    }, [hostElement, setBootstrapTabReady, value]);

    useIsomorphicLayoutEffect(() => {
      if (!hostElement || !id) {
        return;
      }

      return registerRenderedTab({
        host: hostElement,
        id,
        marker: markerRef.current,
        root: tabRootRef.current,
        trigger: null,
        value,
        width: getIntrinsicMeasuredWidth(tabRootRef.current),
      });
    }, [hostElement, id, registerRenderedTab, value]);

    useIsomorphicLayoutEffect(() => {
      const updates = {
        marker: markerRef.current,
        root: tabRootRef.current,
      } as Partial<{
        host: HTMLDivElement;
        id: string;
        marker: HTMLElement | null;
        root: HTMLElement | null;
        trigger: HTMLButtonElement | null;
        width: number;
      }>;

      if (renderMode === "inline") {
        updates.width = getIntrinsicMeasuredWidth(tabRootRef.current);
      }

      updateRenderedTab(value, updates);
    }, [renderMode, updateRenderedTab, value]);

    useRenderedTabWidth({
      hostElement,
      renderMode,
      tabRootRef,
      targetWindow,
      updateRenderedTab,
      value,
    });

    const handleTabRootRef = useForkRef(tabRootRef, ref);

    const tabMarkup = (
      <TabContext.Provider value={context}>
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
      </TabContext.Provider>
    );

    return (
      <>
        <span role="presentation" data-tab-marker="" hidden ref={markerRef} />
        {renderMode === "inline"
          ? tabMarkup
          : hostElement
            ? createPortal(tabMarkup, hostElement)
            : null}
      </>
    );
  },
);
