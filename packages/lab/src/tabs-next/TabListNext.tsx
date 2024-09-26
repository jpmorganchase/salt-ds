import { Button, capitalize, makePrefixer, useForkRef } from "@salt-ds/core";
import { AddIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type KeyboardEvent,
  type SyntheticEvent,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import tablistNextCss from "./TabListNext.css";
import { TabOverflowList } from "./TabOverflowList";
import { useTabsNext } from "./TabsNextContext";
import { TabstripNextContext } from "./TabstripNextContext";
import { useCollection } from "./hooks/useCollection";
import { useOverflow } from "./hooks/useOverflow";

const withBaseName = makePrefixer("saltTabListNext");

export interface TabListNextProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /* Styling active color variant. Defaults to "primary". */
  activeColor?: "primary" | "secondary" | "tertiary";
  /* Tabs alignment. Defaults to "left" */
  align?: "left" | "center" | "right";
  /* The Tabs variant */
  variant?: "main" | "inline";
  onAdd?: () => void;
  onClose?: (event: SyntheticEvent, value: string) => void;
}

export const TabListNext = forwardRef<HTMLDivElement, TabListNextProps>(
  function TabstripNext(props, ref) {
    const {
      activeColor = "primary",
      align = "left",
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

    const { selected, active, setSelected, setActive } = useTabsNext();

    const {
      registerItem,
      item,
      getNext,
      getPrevious,
      getFirst,
      getLast,
      items,
    } = useCollection({ wrap: true });

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

    const movedRef = useRef(false);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (!active) return;
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
        const nextId = action(active);
        if (nextId) {
          movedRef.current = true;
          setActive(nextId);
        }
      }
    };

    const handleClose = useCallback(
      (event: SyntheticEvent, id: string) => {
        const first = getFirst();
        const newActive = id === first ? getNext(id) : getPrevious(id);
        if (id === selected) {
          setSelected(event, newActive);
        } else {
          setActive(newActive);
        }
        onClose?.(event, id);
      },
      [getFirst, getNext, getPrevious, selected, onClose],
    );

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      if (!movedRef.current) return;
      const itemElement = item(active)?.element;
      if (itemElement) {
        itemElement.focus({ preventScroll: true });
        itemElement.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }, [active]);

    const [focusInside, setFocusInside] = useState(false);

    const handleFocus = (event: FocusEvent) => {
      if (event.target !== addButtonRef.current) {
        setFocusInside(true);
      }
    };

    const handleBlur = () => {
      setFocusInside(false);
    };

    const contextValue = useMemo(
      () => ({
        registerItem,
        variant,
        setSelected,
        selected,
        setActive,
        focusInside,
        handleClose,
      }),
      [variant, setSelected, selected, registerItem, focusInside, handleClose],
    );

    return (
      <TabstripNextContext.Provider value={contextValue}>
        <div
          role="tablist"
          className={clsx(
            withBaseName(),
            withBaseName(variant),
            withBaseName("horizontal"),
            withBaseName(`activeColor${capitalize(activeColor)}`),
            { [withBaseName(align)]: align },
            className,
          )}
          ref={handleRef}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
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
      </TabstripNextContext.Provider>
    );
  },
);
