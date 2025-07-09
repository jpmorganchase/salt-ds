import {
  FloatingTree,
  flip,
  offset,
  size,
  useDismiss,
  useInteractions,
} from "@floating-ui/react";
import {
  Button,
  makePrefixer,
  useFloatingUI,
  useForkRef,
  useIcon,
  useId,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  Children,
  type ComponentPropsWithoutRef,
  type Dispatch,
  forwardRef,
  type ReactNode,
  type Ref,
  type RefObject,
  type SetStateAction,
  useCallback,
  useRef,
} from "react";
import { useFocusOutside } from "./hooks/useFocusOutside";
import tabOverflowListCss from "./TabOverflowList.css";

interface TabOverflowListProps extends ComponentPropsWithoutRef<"button"> {
  buttonRef?: Ref<HTMLButtonElement>;
  tabstripRef: RefObject<HTMLDivElement>;
  children?: ReactNode;
  isMeasuring?: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const withBaseName = makePrefixer("saltTabOverflow");

export const TabOverflowList = forwardRef<HTMLDivElement, TabOverflowListProps>(
  function TabOverflowList(props, ref) {
    const {
      buttonRef,
      tabstripRef,
      children,
      isMeasuring,
      open,
      setOpen,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tabs-next-overflow-list",
      css: tabOverflowListCss,
      window: targetWindow,
    });

    const { OverflowIcon } = useIcon();

    const { refs, x, y, strategy, context } = useFloatingUI({
      open: open,
      onOpenChange(open, _, reason) {
        if (reason === "escape-key") {
          queueMicrotask(() => {
            const allTabs =
              tabstripRef.current?.querySelectorAll<HTMLElement>(
                '[role="tab"]:not([aria-hidden])',
              ) ?? [];
            const numberOfTabsInOverflow =
              listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')
                .length ?? 0;

            allTabs[allTabs.length - numberOfTabsInOverflow - 1]?.focus({
              preventScroll: true,
            });
          });
        }

        setOpen(open);
      },
      placement: "bottom-start",
      middleware: [
        offset(1),
        size({
          apply({ elements, availableHeight }) {
            Object.assign(elements.floating.style, {
              maxHeight: `max(calc((var(--salt-size-base) + var(--salt-spacing-100)) * 5), calc(${availableHeight}px - var(--salt-spacing-100)))`,
            });
          },
        }),
        flip(),
      ],
    });

    const { getFloatingProps } = useInteractions([useDismiss(context)]);

    const rootRef = useRef<HTMLDivElement>(null);
    const handleRootRef = useForkRef(rootRef, ref);
    const listRef = useRef<HTMLDivElement>(null);
    const handleListRef = useForkRef<HTMLDivElement>(listRef, refs.setFloating);

    const handleFocusOutside = useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    useFocusOutside(
      rootRef,
      handleFocusOutside,
      open,
      "[data-floating-ui-portal]",
    );

    const handleClick = () => {
      if (!open) {
        listRef.current
          ?.querySelectorAll<HTMLElement>('[role="tab"]')[0]
          ?.focus({ preventScroll: true });
      } else {
        setOpen(false);
      }
    };

    const handleFocus = () => {
      setOpen(true);
    };

    const handleButtonRef = useForkRef<HTMLButtonElement>(
      buttonRef,
      refs.setReference,
    );

    const listId = useId();

    const childCount = Children.count(children);
    if (childCount === 0 && !isMeasuring) return null;

    return (
      <div className={withBaseName()} ref={handleRootRef} data-overflow>
        <Button
          data-overflowbutton
          tabIndex={-1}
          appearance="transparent"
          sentiment="neutral"
          onClick={handleClick}
          ref={handleButtonRef}
          aria-label={`Overflow menu. ${childCount} tabs hidden`}
          aria-expanded={open}
          aria-controls={listId}
          aria-hidden="true"
          role="tab"
          aria-haspopup
          {...rest}
        >
          <OverflowIcon aria-hidden />
        </Button>
        <FloatingTree>
          <div
            ref={handleListRef}
            {...getFloatingProps({
              onFocus: handleFocus,
              role: "presentation",
            })}
            className={withBaseName("list")}
            data-hidden={!open}
            style={
              open
                ? { left: x ?? 0, top: y ?? 0, position: strategy }
                : undefined
            }
            id={listId}
          >
            <div className={withBaseName("listContainer")}>{children}</div>
          </div>
        </FloatingTree>
      </div>
    );
  },
);
