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
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { tabbable } from "tabbable";
import tabPanelCss from "./TabNextPanel.css";
import { useTabsNext } from "./TabsNextContext";

export interface TabNextPanelProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The value of the panel, this should map to the corresponding tab.
   */
  value: string;
}

const withBaseName = makePrefixer("saltTabNextPanel");

export const TabNextPanel = forwardRef<HTMLDivElement, TabNextPanelProps>(
  function TabNextPanel(props, ref) {
    const { className, children, id: idProp, value, ...rest } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tab-next-panel",
      css: tabPanelCss,
      window: targetWindow,
    });
    const id = useId(idProp);
    const { registerPanel, getTabId, selected } = useTabsNext();
    const hidden = selected !== value;

    const panelRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(panelRef, ref);

    useIsomorphicLayoutEffect(() => {
      if (value && id) {
        return registerPanel(id, value);
      }
    }, [value, id, registerPanel]);

    const [hasFocusableChildren, setHasFocusableChildren] = useState(false);
    useEffect(() => {
      const element = panelRef.current;
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
        if (rafId != null) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(detectFocusableChildren);
      };

      const observer = new MutationObserver(() => {
        scheduleDetectFocusableChildren();
      });

      scheduleDetectFocusableChildren();

      observer.observe(element, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      return () => {
        observer.disconnect();
        if (rafId != null) {
          cancelAnimationFrame(rafId);
        }
      };
    }, [hidden]);

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
