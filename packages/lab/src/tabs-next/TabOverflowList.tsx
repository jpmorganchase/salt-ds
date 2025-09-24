import {
  FloatingList,
  flip,
  offset,
  size,
  useClick,
  useDismiss,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import {
  Button,
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
  useForkRef,
  useIcon,
  useId,
  useIsomorphicLayoutEffect,
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
  type SetStateAction,
  useRef,
  useState,
} from "react";
import { TabOverflowContext } from "./TabOverflowContext";
import tabOverflowListCss from "./TabOverflowList.css";
import { useTabsNext } from "./TabsNextContext";

interface TabOverflowListProps extends ComponentPropsWithoutRef<"button"> {
  buttonRef?: Ref<HTMLButtonElement>;
  children?: ReactNode;
  isMeasuring?: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const withBaseName = makePrefixer("saltTabOverflow");

export const TabOverflowList = forwardRef<HTMLDivElement, TabOverflowListProps>(
  function TabOverflowList(props, ref) {
    const { buttonRef, children, isMeasuring, open, setOpen, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tabs-next-overflow-list",
      css: tabOverflowListCss,
      window: targetWindow,
    });

    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const overflowRef = useRef<HTMLButtonElement>(null);

    const { OverflowIcon } = useIcon();
    const { registerTab, activeTab } = useTabsNext();

    const { refs, x, y, strategy, context, elements } = useFloatingUI({
      open: open,
      onOpenChange(open, _, reason) {
        setOpen(open);

        if (reason === "escape-key") {
          overflowRef.current?.focus();
        }
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

    const listNavigationRef = useRef<HTMLButtonElement[]>([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const { getFloatingProps, getReferenceProps } = useInteractions([
      useRole(context, { role: "dialog" }),
      useClick(context),
      useDismiss(context),
    ]);

    const { getFloatingProps: getListFloatingProps, getItemProps } =
      useInteractions([
        useListNavigation(context, {
          listRef: listNavigationRef,
          activeIndex,
          onNavigate: setActiveIndex,
          loop: true,
          scrollItemIntoView: { block: "nearest", inline: "nearest" },
          focusItemOnOpen: true,
        }),
      ]);

    const handleRootRef = useForkRef(rootRef, ref);
    const handleListRef = useForkRef<HTMLDivElement>(listRef, refs.setFloating);

    const handleButtonRef = useForkRef<HTMLButtonElement>(
      buttonRef,
      refs.setReference,
    );
    const handleRef = useForkRef(handleButtonRef, overflowRef);

    const { Component: FloatingComponent } = useFloatingComponent();

    const overflowId = useId();

    const handleFocus = () => {
      if (overflowId) {
        activeTab.current = { value: overflowId, id: overflowId };
      }
    };

    const childCount = Children.count(children);

    useIsomorphicLayoutEffect(() => {
      if (overflowId && overflowRef.current && childCount > 0) {
        return registerTab({
          id: overflowId,
          value: overflowId,
          element: overflowRef.current,
        });
      }
    }, [overflowId, registerTab, childCount]);

    if (childCount === 0 && !isMeasuring) return null;

    return (
      <TabOverflowContext.Provider value={{ activeIndex, getItemProps }}>
        <div className={withBaseName()} ref={handleRootRef} data-overflow>
          <Button
            data-overflowbutton
            appearance="transparent"
            sentiment="neutral"
            {...getReferenceProps({
              onFocus: handleFocus,
            })}
            ref={handleRef}
            aria-label={`${childCount} tabs hidden`}
            role="tab"
            tabIndex={-1}
            {...rest}
          >
            <OverflowIcon aria-hidden />
          </Button>
          <FloatingList elementsRef={listNavigationRef}>
            <FloatingComponent
              ref={handleListRef}
              {...getFloatingProps({
                role: "dialog",
              })}
              aria-label="Overflow Menu"
              focusManagerProps={
                context
                  ? {
                      context,
                      returnFocus: false,
                      modal: true,
                    }
                  : undefined
              }
              className={withBaseName("list")}
              open={open}
              left={x ?? 0}
              top={y ?? 0}
              position={strategy}
              width={elements.floating?.offsetWidth}
              height={elements.floating?.offsetHeight}
            >
              <div
                role="tablist"
                {...getListFloatingProps()}
                className={withBaseName("listContainer")}
              >
                {children}
              </div>
            </FloatingComponent>
          </FloatingList>
        </div>
      </TabOverflowContext.Provider>
    );
  },
);
