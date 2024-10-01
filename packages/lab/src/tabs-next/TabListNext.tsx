import { Button, capitalize, makePrefixer, useForkRef } from "@salt-ds/core";
import { AddIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type SyntheticEvent,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import tablistNextCss from "./TabListNext.css";
import { TabListNextContext } from "./TabListNextContext";
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
   * The tab variant, "main" should be shown at the top of the page under the app header. "inline" should be used everywhere else. Defaults to "main".
   */
  variant?: "main" | "inline";
  /**
   * Callback fired when add button is triggered.
   */
  onAdd?: () => void;
  /**
   * Callback fired when a tab is closed.
   */
  onClose?: (event: SyntheticEvent, value: string) => void;
}

export const TabListNext = forwardRef<HTMLDivElement, TabListNextProps>(
  function TabstripNext(props, ref) {
    const {
      activeColor = "primary",
      children,
      className,
      onAdd,
      onClose,
      onKeyDown,
      variant = "main",
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
      setSelected,
      getNext,
      getPrevious,
      getFirst,
      getLast,
      items,
    } = useTabsNext();

    const tabstripRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(tabstripRef, ref);
    const addButtonRef = useRef<HTMLButtonElement>(null);
    const overflowButtonRef = useRef<HTMLButtonElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const [visible, hidden, isMeasuring] = useOverflow({
      container: tabstripRef,
      tabs: items,
      children,
      selected,
      addButton: addButtonRef,
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
        const activeTabId = targetWindow?.document.activeElement?.id;
        if (!activeTabId) return;
        const nextItem = action(activeTabId);
        if (nextItem) {
          nextItem.element?.focus({ preventScroll: true });
        }
      }
    };

    const handleClose = useCallback(
      (event: SyntheticEvent, id: string) => {
        const firstItem = getFirst();
        const newActive = id === firstItem?.id ? getNext(id) : getPrevious(id);
        onClose?.(event, id);

        if (!newActive) return;
        if (id === selected) {
          setSelected(event, newActive.value);
        } else {
          newActive?.element?.focus({ preventScroll: true });
        }
      },
      [getFirst, getNext, getPrevious, selected, onClose],
    );

    const contextValue = useMemo(
      () => ({
        variant,
        handleClose,
      }),
      [variant, handleClose],
    );

    return (
      <TabListNextContext.Provider value={contextValue}>
        <div
          role="tablist"
          className={clsx(
            withBaseName(),
            withBaseName(variant),
            withBaseName("horizontal"),
            withBaseName(`activeColor${capitalize(activeColor)}`),
            className,
          )}
          ref={handleRef}
          onKeyDown={handleKeyDown}
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
          {onAdd && (
            <Button
              ref={addButtonRef}
              aria-label="Add Tab"
              appearance="transparent"
              sentiment="neutral"
              onClick={onAdd}
            >
              <AddIcon aria-hidden />
            </Button>
          )}
        </div>
      </TabListNextContext.Provider>
    );
  },
);
