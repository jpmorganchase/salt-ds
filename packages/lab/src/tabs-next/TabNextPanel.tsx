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

    const panelRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(panelRef, ref);

    useIsomorphicLayoutEffect(() => {
      if (value && id) {
        return registerPanel(id, value);
      }
    }, [value, id, registerPanel]);

    const [hasFocusableChildren, setHasFocusableChildren] = useState(false);
    useEffect(() => {
      if (!panelRef.current) return;

      const detectFocusableChildren = () => {
        requestAnimationFrame(() => {
          if (!panelRef.current) return;
          const elements = tabbable(panelRef.current);
          setHasFocusableChildren(elements.length > 0);
        });
      };

      const observer = new MutationObserver(() => {
        detectFocusableChildren();
      });

      requestAnimationFrame(() => {
        detectFocusableChildren();
      });

      observer.observe(panelRef.current, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
      };
    }, []);

    const hidden = selected !== value;
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
