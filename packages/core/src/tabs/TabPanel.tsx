import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { tabbable } from "tabbable";
import {
  makePrefixer,
  useForkRef,
  useId,
  useIsomorphicLayoutEffect,
} from "../utils";
import { useTabs } from "./internal/contexts/TabsContext";
import tabPanelCss from "./TabPanel.css";

export interface TabPanelProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The value of the panel. This should map to the corresponding tab and must
   * be unique within a `Tabs` instance.
   */
  value: string;
}

const withBaseName = makePrefixer("saltTabPanel");

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  function TabPanel(props, ref) {
    const { className, children, id: idProp, value, ...rest } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tab-panel",
      css: tabPanelCss,
      window: targetWindow,
    });
    const id = useId(idProp);
    const { registerPanel, getTabId, selected } = useTabs();
    const hidden = selected !== value;

    const panelRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(panelRef, ref);

    useIsomorphicLayoutEffect(() => {
      if (id) {
        return registerPanel(id, value);
      }
    }, [value, id, registerPanel]);

    const [hasFocusableChildren, setHasFocusableChildren] = useState(false);
    useEffect(() => {
      const element = panelRef.current;
      const mutationObserverCtor = (
        targetWindow as
          | (Window & { MutationObserver?: typeof MutationObserver })
          | undefined
      )?.MutationObserver;
      if (!element || hidden) return;

      let rafId: number | null = null;

      const detectFocusableChildren = () => {
        rafId = null;
        const elements = tabbable(element);
        const nextHasFocusableChildren = elements.length > 0;
        setHasFocusableChildren((prev) => {
          return prev === nextHasFocusableChildren
            ? prev
            : nextHasFocusableChildren;
        });
      };

      const scheduleDetectFocusableChildren = () => {
        if (rafId != null && targetWindow) {
          targetWindow.cancelAnimationFrame(rafId);
        }

        if (!targetWindow?.requestAnimationFrame) {
          detectFocusableChildren();
          return;
        }

        rafId = targetWindow.requestAnimationFrame(detectFocusableChildren);
      };

      const observer = mutationObserverCtor
        ? new mutationObserverCtor(() => {
            scheduleDetectFocusableChildren();
          })
        : null;

      scheduleDetectFocusableChildren();

      observer?.observe(element, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      return () => {
        observer?.disconnect();
        if (rafId != null && targetWindow) {
          targetWindow.cancelAnimationFrame(rafId);
        }
      };
    }, [hidden, targetWindow]);

    const tabId = getTabId(value);

    return (
      <div
        id={id}
        ref={handleRef}
        role="tabpanel"
        aria-labelledby={tabId}
        className={clsx(withBaseName(), className)}
        hidden={hidden || undefined}
        tabIndex={hidden || hasFocusableChildren ? undefined : 0}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
