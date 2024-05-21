import { makePrefixer, useForkRef, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  useLayoutEffect,
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
    const { children, id: idProp, value, ...rest } = props;
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

    useEffect(() => {
      if (value && id) {
        return registerPanel(id, value);
      }
    }, [value, id, registerPanel]);

    const [tabId, setTabId] = useState<string | undefined>(undefined);
    useLayoutEffect(() => {
      setTabId(getTabId(value));
    }, [getTabId, value]);

    const [hasFocusableChildren, setHasFocusableChildren] = useState(false);
    useEffect(() => {
      if (!panelRef.current) return;

      const elements = tabbable(panelRef.current, { includeContainer: true });
      setHasFocusableChildren(elements.length > 0);
    }, []);

    return (
      <div
        id={id}
        ref={handleRef}
        role="tabpanel"
        aria-labelledby={tabId}
        className={withBaseName()}
        hidden={selected !== value || undefined}
        tabIndex={hasFocusableChildren ? undefined : 0}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
