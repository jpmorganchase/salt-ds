import { capitalize, makePrefixer, useForkRef, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type KeyboardEvent,
  useRef,
} from "react";
import { useOverflow } from "./hooks/useOverflow";
import { useRestoreActiveTab } from "./hooks/useRestoreActiveTab";
import tablistNextCss from "./TabListNext.css";
import { TabOverflowList } from "./TabOverflowList";
import { useTabsNext } from "./TabsNextContext";

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
}

export const TabListNext = forwardRef<HTMLDivElement, TabListNextProps>(
  function TabstripNext(props, ref) {
    const {
      appearance = "bordered",
      activeColor = "primary",
      "aria-describedby": ariaDescribedBy,
      children,
      className,
      onKeyDown,
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
      menuOpen,
      setMenuOpen,
      removedActiveTabRef,
    } = useTabsNext();

    const tabstripRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(tabstripRef, ref);
    const overflowButtonRef = useRef<HTMLButtonElement>(null);

    const [visible, hidden, isMeasuring, realSelectedIndexRef] = useOverflow({
      container: tabstripRef,
      tabs: items,
      children,
      selected,
      overflowButton: overflowButtonRef,
    });

    useRestoreActiveTab({
      container: tabstripRef,
      tabs: items,
      realSelectedIndex: realSelectedIndexRef,
      removedActiveTabRef,
    });

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);

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
          nextItem.element?.scrollIntoView({
            block: "nearest",
            inline: "nearest",
          });
          nextItem.element?.focus({ preventScroll: true });
        }
      }
    };

    const warningId = useId();

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
        aria-describedby={clsx(ariaDescribedBy, warningId)}
        {...rest}
      >
        {!isMeasuring && hidden.length > 0 && (
          <span id={warningId} className={withBaseName("overflowWarning")}>
            Note: This tab list includes overflow; tab positions may be
            inaccurate or change when a tab is selected
          </span>
        )}
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
