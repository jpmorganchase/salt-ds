import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ElementType,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { useIcon } from "../semantic-icon-provider";
import { makePrefixer, type RenderPropsType } from "../utils";
import { Breadcrumb, type BreadcrumbProps } from "./Breadcrumb";
import breadcrumbsCss from "./Breadcrumbs.css";
import { BreadcrumbContext } from "./internal/BreadcrumbContext";
import { BreadcrumbOverflowDisclosure } from "./internal/BreadcrumbOverflowDisclosure";
import {
  flattenBreadcrumbItems,
  type NormalizedBreadcrumb,
} from "./internal/breadcrumbItems";

const withBaseName = makePrefixer("saltBreadcrumbs");
const withItemBaseName = makePrefixer("saltBreadcrumb");

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

export interface BreadcrumbsProps
  extends Omit<ComponentPropsWithoutRef<"nav">, "children"> {
  /**
   * Breadcrumb items.
   */
  children?: ReactNode;
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
   * Render prop to enable customization of the underlying link elements.
   */
  render?: RenderPropsType["render"];
  /**
   * If `true`, breadcrumbs can wrap onto multiple lines.
   * Defaults to `false`.
   */
  wrap?: boolean;
}

function isBreadcrumbElement(
  child: ReactNode,
): child is ReactElement<BreadcrumbProps> {
  return isValidElement<BreadcrumbProps>(child) && child.type === Breadcrumb;
}

function getCurrentIndex(items: NormalizedBreadcrumb[]) {
  const explicitCurrentIndex = items.findIndex(({ props }) => props.current);

  return explicitCurrentIndex === -1
    ? Math.max(items.length - 1, 0)
    : explicitCurrentIndex;
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

  return {
    hiddenItems,
    visibleAfter: items.slice(hiddenEnd),
    visibleBefore: items.slice(0, hiddenStart),
  };
}

function renderSeparator(SeparatorIcon: ElementType) {
  return (
    <SeparatorIcon aria-hidden className={withItemBaseName("separator")} />
  );
}

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  function Breadcrumbs(props, ref) {
    const {
      children,
      className,
      itemsAfterCollapse = 1,
      itemsBeforeCollapse = 1,
      maxItems,
      render,
      wrap = false,
      ...rest
    } = props;
    const targetWindow = useWindow();
    const { LevelSeparatorIcon } = useIcon();

    useComponentCssInjection({
      testId: "salt-breadcrumbs",
      css: breadcrumbsCss,
      window: targetWindow,
    });

    const items = flattenBreadcrumbItems(children)
      .filter(isBreadcrumbElement)
      .map((element, index) => ({
        element,
        index,
        key: element.key ?? index,
        props: element.props,
      }));

    const currentIndex = getCurrentIndex(items);
    const shouldCollapse =
      !wrap && maxItems !== undefined && items.length > maxItems;

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
                  key="breadcrumbs-collapse"
                >
                  <BreadcrumbOverflowDisclosure
                    currentIndex={currentIndex}
                    items={part.hiddenItems}
                    render={render}
                  />
                  {showSeparator ? renderSeparator(LevelSeparatorIcon) : null}
                </li>
              );
            }

            return (
              <BreadcrumbContext.Provider
                key={part.item.key}
                value={{
                  current: part.item.index === currentIndex,
                  placement: "trail",
                  render,
                  showSeparator,
                }}
              >
                {part.item.element}
              </BreadcrumbContext.Provider>
            );
          })}
        </ol>
      </nav>
    );
  },
);
