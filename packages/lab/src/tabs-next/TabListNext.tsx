import { capitalize, makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type KeyboardEvent,
  type SyntheticEvent,
  forwardRef,
  useRef,
  useState,
} from "react";

import tablistNextCss from "./TabListNext.css";
import { TabOverflowList } from "./TabOverflowList";
import { useTabsNext } from "./TabsNextContext";
import { useOverflow } from "./hooks/useOverflow";

const withBaseName = makePrefixer("saltTabListNext");

export interface TabListNextProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /**
   * Styling active color variant. Defaults to "primary".
   */
  activeColor?: "primary" | "secondary" | "tertiary";
  /**
   * The appearance of the tabs. Defaults to "bordered".
   */
  appearance?: "bordered" | "transparent";
  /**
   * Callback fired when a tab is closed.
   */
  onClose?: (event: SyntheticEvent, value: string) => void;
}

export const TabListNext = forwardRef<HTMLDivElement, TabListNextProps>(
  function TabstripNext(props, ref) {
    const {
      appearance = "bordered",
      activeColor = "primary",
      children,
      className,
      onClose,
      onKeyDown,
      onBlur,
      ...rest
    } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tablist-next",
      css: tablistNextCss,
      window: targetWindow,
    });

    const {
      selected,
      getNext,
      getPrevious,
      getFirst,
      getLast,
      items,
      activeTab,
    } = useTabsNext();

    const tabstripRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(tabstripRef, ref);
    const overflowButtonRef = useRef<HTMLButtonElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const [visible, hidden, isMeasuring] = useOverflow({
      container: tabstripRef,
      tabs: items,
      children,
      selected,
      overflowButton: overflowButtonRef,
    });

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      const actionMap = {
        ArrowRight: getNext,
        ArrowLeft: getPrevious,
        Home: getFirst,
        End: getLast,
        ArrowUp: menuOpen ? getPrevious : undefined,
        ArrowDown: menuOpen ? getNext : undefined,
      };

      const action = actionMap[event.key as keyof typeof actionMap];

      if (action) {
        event.preventDefault();
        const activeTabId = activeTab.current?.id;
        if (!activeTabId) return;
        const nextItem = action(activeTabId);
        if (nextItem) {
          nextItem.element?.focus();
        }
      }
    };

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
      onBlur?.(event);

      if (!event.currentTarget.contains(event.relatedTarget)) {
        activeTab.current = undefined;
      }
    };

    return (
      <div
        role="tablist"
        className={clsx(
          withBaseName(),
          withBaseName(appearance),
          withBaseName("horizontal"),
          withBaseName(`activeColor${capitalize(activeColor)}`),
          className,
        )}
        data-ismeasuring={isMeasuring ? true : undefined}
        ref={handleRef}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        {...rest}
      >
        {visible}
        <TabOverflowList
          isMeasuring={isMeasuring}
          buttonRef={overflowButtonRef}
          tabstripRef={tabstripRef}
          open={menuOpen}
          setOpen={setMenuOpen}
        >
          {hidden}
        </TabOverflowList>
      </div>
    );
  },
);
