import {
  Button,
  Link,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  makePrefixer,
  useControlled,
  useIcon,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { OverflowMenuIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  type ComponentPropsWithoutRef,
  type ElementType,
  forwardRef,
  isValidElement,
  type Key,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
  useRef,
} from "react";
import { BreadcrumbNext, type BreadcrumbNextProps } from "./BreadcrumbNext";
import breadcrumbsNextCss from "./BreadcrumbsNext.css";
import { BreadcrumbNextContext } from "./internal/BreadcrumbNextContext";

const withBaseName = makePrefixer("saltBreadcrumbsNext");
const withItemBaseName = makePrefixer("saltBreadcrumbNext");

type BreadcrumbTriggerElement = HTMLAnchorElement | HTMLSpanElement;

interface NormalizedBreadcrumb {
  element: ReactElement<BreadcrumbNextProps>;
  index: number;
  key: Key | null;
  props: BreadcrumbNextProps;
}

interface CollapseRange {
  hiddenItems: NormalizedBreadcrumb[];
  visibleAfter: NormalizedBreadcrumb[];
  visibleBefore: NormalizedBreadcrumb[];
}

type RenderPart =
  | {
      item: NormalizedBreadcrumb;
      type: "breadcrumb";
    }
  | {
      hiddenItems: NormalizedBreadcrumb[];
      type: "collapse";
    };

export interface BreadcrumbsNextProps
  extends Omit<ComponentPropsWithoutRef<"nav">, "children"> {
  /**
   * Breadcrumb items.
   */
  children?: ReactNode;
  /**
   * The collapse behavior used when the number of breadcrumbs exceeds `maxItems`.
   * Defaults to "menu".
   */
  collapseMode?: "expand" | "menu";
  /**
   * Whether inline expansion is expanded by default.
   */
  defaultExpanded?: boolean;
  /**
   * Whether inline expansion is expanded.
   */
  expanded?: boolean;
  /**
   * The number of items to keep after the collapse point.
   * Defaults to 1.
   */
  itemsAfterCollapse?: number;
  /**
   * The number of items to keep before the collapse point.
   * Defaults to 1.
   */
  itemsBeforeCollapse?: number;
  /**
   * The maximum number of breadcrumbs to render before collapsing.
   */
  maxItems?: number;
  /**
   * Callback fired when inline expansion is toggled.
   */
  onExpandedChange?: (
    event: SyntheticEvent<HTMLButtonElement>,
    expanded: boolean,
  ) => void;
  /**
   * If `true`, breadcrumbs can wrap onto multiple lines.
   * Defaults to `false`.
   */
  wrap?: boolean;
}

function isBreadcrumbNextElement(
  child: ReactNode,
): child is ReactElement<BreadcrumbNextProps> {
  return (
    isValidElement<BreadcrumbNextProps>(child) && child.type === BreadcrumbNext
  );
}

function getNonNegativeInteger(
  value: number | undefined,
  defaultValue: number,
) {
  if (value === undefined || !Number.isFinite(value)) {
    return defaultValue;
  }

  return Math.max(0, Math.floor(value));
}

function getPositiveInteger(value: number | undefined, defaultValue: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return defaultValue;
  }

  return Math.max(1, Math.floor(value));
}

function getExplicitCurrentIndex(items: NormalizedBreadcrumb[]) {
  return items.findIndex(({ props }) => props.current);
}

function getCurrentIndex(items: NormalizedBreadcrumb[]) {
  const explicitCurrentIndex = getExplicitCurrentIndex(items);

  return explicitCurrentIndex === -1
    ? Math.max(items.length - 1, 0)
    : explicitCurrentIndex;
}

function getMenuItemLabel({ children, label }: BreadcrumbNextProps) {
  return label ?? (isPrimitiveLabel(children) ? children : undefined);
}

function isPrimitiveLabel(children: ReactNode) {
  return typeof children === "string" || typeof children === "number";
}

function getCollapseRange({
  currentIndex,
  items,
  itemsAfterCollapse,
  itemsBeforeCollapse,
}: {
  currentIndex: number;
  items: NormalizedBreadcrumb[];
  itemsAfterCollapse: number;
  itemsBeforeCollapse: number;
}): CollapseRange | undefined {
  const itemCount = items.length;
  const effectiveItemsAfterCollapse = Math.max(
    itemsAfterCollapse,
    itemCount - currentIndex,
  );

  if (itemsBeforeCollapse + effectiveItemsAfterCollapse >= itemCount) {
    return undefined;
  }

  const hiddenStart = itemsBeforeCollapse;
  const hiddenEnd = itemCount - effectiveItemsAfterCollapse;
  const hiddenItems = items.slice(hiddenStart, hiddenEnd);

  if (hiddenItems.length === 0) {
    return undefined;
  }

  return {
    hiddenItems,
    visibleAfter: items.slice(hiddenEnd),
    visibleBefore: items.slice(0, hiddenStart),
  };
}

function getBestFocusableBreadcrumb({
  itemCount,
  items,
  preferredIndex,
}: {
  itemCount: number;
  items: Map<number, BreadcrumbTriggerElement>;
  preferredIndex: number;
}) {
  for (let index = preferredIndex; index < itemCount; index++) {
    const focusableElement = items.get(index);

    if (focusableElement && focusableElement.tabIndex >= 0) {
      return focusableElement;
    }
  }

  for (let index = preferredIndex - 1; index >= 0; index--) {
    const focusableElement = items.get(index);

    if (focusableElement && focusableElement.tabIndex >= 0) {
      return focusableElement;
    }
  }
}

function BreadcrumbOverflowMenuItem({ item }: { item: NormalizedBreadcrumb }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const hasNavigation =
    item.props.href !== undefined || item.props.render !== undefined;
  const label = getMenuItemLabel(item.props);

  // need to do this since menu doesn't allow for rendering <a> or has a render prop
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!hasNavigation || !linkRef.current) {
      return;
    }

    const target = event.target;

    if (
      target instanceof window.Node &&
      (target === linkRef.current || linkRef.current.contains(target))
    ) {
      return;
    }

    linkRef.current.click();
  };

  return (
    <MenuItem onClick={handleClick}>
      {hasNavigation ? (
        <Link
          className={withBaseName("menuLink")}
          href={item.props.href}
          maxRows={1}
          ref={linkRef}
          render={item.props.render}
          styleAs="label"
          tabIndex={-1}
        >
          {label}
        </Link>
      ) : (
        label
      )}
    </MenuItem>
  );
}

function renderSeparator(SeparatorIcon: ElementType) {
  return (
    <SeparatorIcon aria-hidden className={withItemBaseName("separator")} />
  );
}

export const BreadcrumbsNext = forwardRef<HTMLElement, BreadcrumbsNextProps>(
  function BreadcrumbsNext(props, ref) {
    const {
      children,
      className,
      collapseMode = "menu",
      defaultExpanded,
      expanded: expandedProp,
      itemsAfterCollapse: itemsAfterCollapseProp,
      itemsBeforeCollapse: itemsBeforeCollapseProp,
      maxItems,
      onExpandedChange,
      wrap = false,
      ...rest
    } = props;
    const targetWindow = useWindow();
    const triggerElements = useRef(new Map<number, BreadcrumbTriggerElement>());
    const pendingExpansionFocusIndex = useRef<number | null>(null);
    const { BreadcrumbSeparatorIcon } = useIcon();

    useComponentCssInjection({
      testId: "salt-breadcrumbs-next",
      css: breadcrumbsNextCss,
      window: targetWindow,
    });

    const [expanded, setExpanded] = useControlled({
      controlled: expandedProp,
      default: Boolean(defaultExpanded),
      name: "BreadcrumbsNext",
      state: "expanded",
    });

    const items = Children.toArray(children)
      .filter(isBreadcrumbNextElement)
      .map((element, index) => ({
        element,
        index,
        key: element.key,
        props: element.props,
      }));

    const currentIndex = getCurrentIndex(items);
    const itemsBeforeCollapse = getNonNegativeInteger(
      itemsBeforeCollapseProp,
      1,
    );
    const itemsAfterCollapse = getPositiveInteger(itemsAfterCollapseProp, 1);
    const shouldCollapse =
      !wrap &&
      maxItems !== undefined &&
      items.length > maxItems &&
      !(collapseMode === "expand" && expanded);
    const collapseRange = shouldCollapse
      ? getCollapseRange({
          currentIndex,
          items,
          itemsAfterCollapse,
          itemsBeforeCollapse,
        })
      : undefined;
    const renderParts: RenderPart[] = collapseRange
      ? [
          ...collapseRange.visibleBefore.map(
            (item): RenderPart => ({ item, type: "breadcrumb" }),
          ),
          {
            hiddenItems: collapseRange.hiddenItems,
            type: "collapse",
          },
          ...collapseRange.visibleAfter.map(
            (item): RenderPart => ({ item, type: "breadcrumb" }),
          ),
        ]
      : items.map((item): RenderPart => ({ item, type: "breadcrumb" }));

    const handleExpand = (event: MouseEvent<HTMLButtonElement>) => {
      if (event.detail === 0) {
        pendingExpansionFocusIndex.current =
          collapseRange?.hiddenItems[0]?.index ?? null;
      }

      setExpanded(true);
      onExpandedChange?.(event, true);
    };

    useIsomorphicLayoutEffect(() => {
      const preferredIndex = pendingExpansionFocusIndex.current;

      if (!expanded || preferredIndex === null) {
        return;
      }

      pendingExpansionFocusIndex.current = null;

      const focusableElement = getBestFocusableBreadcrumb({
        itemCount: items.length,
        items: triggerElements.current,
        preferredIndex,
      });

      focusableElement?.focus({ preventScroll: true });
    }, [expanded, items.length]);

    return (
      <nav ref={ref} className={clsx(withBaseName(), className)} {...rest}>
        <ol
          className={clsx(withBaseName("ol"), {
            [withBaseName("ol-wrap")]: wrap,
          })}
        >
          {renderParts.map((part, index) => {
            const showSeparator = index < renderParts.length - 1;

            if (part.type === "collapse") {
              return (
                <li
                  className={clsx(
                    withItemBaseName(),
                    withBaseName("collapseItem"),
                  )}
                  key="breadcrumbs-next-collapse"
                >
                  {collapseMode === "expand" ? (
                    <Button
                      aria-label="Show all breadcrumbs"
                      appearance="transparent"
                      className={withBaseName("collapseButton")}
                      onClick={handleExpand}
                    >
                      <OverflowMenuIcon aria-hidden />
                    </Button>
                  ) : (
                    <Menu>
                      <MenuTrigger>
                        <Button
                          aria-label="Show breadcrumb levels"
                          appearance="transparent"
                          className={withBaseName("collapseButton")}
                        >
                          <OverflowMenuIcon aria-hidden />
                        </Button>
                      </MenuTrigger>
                      <MenuPanel>
                        {part.hiddenItems.map((item) => (
                          <BreadcrumbOverflowMenuItem
                            item={item}
                            key={item.key}
                          />
                        ))}
                      </MenuPanel>
                    </Menu>
                  )}
                  {showSeparator
                    ? renderSeparator(BreadcrumbSeparatorIcon)
                    : null}
                </li>
              );
            }

            return (
              <BreadcrumbNextContext.Provider
                key={part.item.key}
                value={{
                  current: part.item.index === currentIndex,
                  showSeparator,
                  triggerRef: (triggerElement) => {
                    if (triggerElement) {
                      triggerElements.current.set(
                        part.item.index,
                        triggerElement,
                      );
                    } else {
                      triggerElements.current.delete(part.item.index);
                    }
                  },
                }}
              >
                {part.item.element}
              </BreadcrumbNextContext.Provider>
            );
          })}
        </ol>
      </nav>
    );
  },
);
