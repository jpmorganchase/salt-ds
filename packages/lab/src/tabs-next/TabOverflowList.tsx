import { offset, size } from "@floating-ui/react";
import {
  Button,
  makePrefixer,
  useFloatingUI,
  useForkRef,
  useId,
} from "@salt-ds/core";
import { OverflowMenuIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  Children,
  type ComponentPropsWithoutRef,
  type Dispatch,
  type FocusEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  type SetStateAction,
  forwardRef,
  useCallback,
  useRef,
} from "react";
import tabOverflowListCss from "./TabOverflowList.css";
import { useDismissWithEscape } from "./hooks/useDismissWithEscape";
import { useFocusOutside } from "./hooks/useFocusOutside";

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

    const { refs, x, y, strategy } = useFloatingUI({
      open: open,
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
      ],
    });

    const listRef = useRef<HTMLDivElement>(null);
    const handleListRef = useForkRef<HTMLDivElement>(listRef, refs.setFloating);

    const handleFocusOutside = useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    useFocusOutside(listRef, handleFocusOutside);

    const handleDismiss = useCallback(() => {
      setTimeout(() => {
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
      }, 0);

      setOpen(false);
    }, [tabstripRef, setOpen]);
    useDismissWithEscape(handleDismiss, open);

    const handleClick = () => {
      if (!open) {
        listRef.current
          ?.querySelectorAll<HTMLElement>('[role="tab"]')[0]
          ?.focus({ preventScroll: true });
      }
    };

    const handleFocus = () => {
      setOpen(true);
    };

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
      console.log(event.currentTarget, event.relatedTarget);
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setOpen(false);
      }
    };

    const handleListClick = () => {
      setOpen(false);
    };

    const handleButtonRef = useForkRef<HTMLButtonElement>(
      buttonRef,
      refs.setReference,
    );

    const listId = useId();

    const childCount = Children.count(children);
    if (childCount === 0 && !isMeasuring) return null;

    return (
      <div className={withBaseName()} ref={ref}>
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
          <OverflowMenuIcon aria-hidden />
        </Button>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <div
          className={withBaseName("list")}
          data-hidden={!open}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={handleListClick}
          ref={handleListRef}
          style={
            open ? { left: x ?? 0, top: y ?? 0, position: strategy } : undefined
          }
          tabIndex={-1}
          id={listId}
        >
          <div className={withBaseName("listContainer")}>{children}</div>
        </div>
      </div>
    );
  },
);
