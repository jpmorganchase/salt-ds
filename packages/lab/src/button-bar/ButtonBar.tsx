import { type ButtonVariant, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useMemo,
} from "react";
import buttonBarCss from "./ButtonBar.css";
import { ButtonBarContext } from "./internal/ButtonBarContext";
import { DescendantProvider } from "./internal/DescendantContext";
import { useDescendants } from "./internal/useDescendants";

export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;

type ButtonBarOrderKey = "order" | "alignLeftOrder" | "stackOrder";
export type ButtonBarSortOrder = "asc" | "desc";

export const DefaultButtonsOrderByVariant: Record<
  ButtonVariant,
  Record<ButtonBarOrderKey, number>
> = {
  cta: {
    order: 0,
    alignLeftOrder: 1,
    stackOrder: 2,
  },
  primary: {
    order: 1,
    alignLeftOrder: 2,
    stackOrder: 1,
  },
  secondary: {
    order: 2,
    alignLeftOrder: 0,
    stackOrder: 0,
  },
};

type OrderedButtonData = { variant?: ButtonVariant } & PartialRecord<
  ButtonBarOrderKey,
  number
>;

function getPriorityForButton(
  item: OrderedButtonData,
  field: ButtonBarOrderKey,
) {
  const variant = item?.variant || "primary";
  return item?.[field] ?? DefaultButtonsOrderByVariant[variant][field];
}
const createComparatorForField = (
  field: ButtonBarOrderKey,
  sort: ButtonBarSortOrder,
  alignLeft: boolean,
  childrenData: Array<OrderedButtonData>,
) => {
  let equalityResult: number;
  if (field === "order" || field === "stackOrder") {
    equalityResult = sort === "asc" ? 1 : 0;
  } else {
    equalityResult = alignLeft ? 1 : -1;
  }

  function createDescComparator(indexA: number, indexB: number) {
    const priorityA = getPriorityForButton(childrenData[indexA], field);
    const priorityB = getPriorityForButton(childrenData[indexB], field);
    if (priorityA == null && priorityB == null) {
      return 0;
    }
    if (priorityA == null) {
      return 1;
    }
    if (priorityB == null) {
      return -1;
    }
    if (priorityA === priorityB) {
      return equalityResult;
    }
    return priorityB - priorityA;
  }

  function createAscComparator(indexA: number, indexB: number) {
    return createDescComparator(indexA, indexB) * -1;
  }

  return sort === "asc" ? createAscComparator : createDescComparator;
};

function alignSecondaryChild(
  orderedChildrenData: Array<OrderedButtonData & { index: number }>,
  sortOrder: ButtonBarSortOrder,
  alignLeft: boolean,
): { index?: number; align?: "left" | "right" } {
  const noSecondaryChildren = { index: undefined, align: undefined };
  if (sortOrder === "asc" || alignLeft) {
    const firstSecondaryChildIndex = orderedChildrenData.findIndex(
      (childData) => childData.variant === "secondary",
    );

    if (firstSecondaryChildIndex !== -1) {
      const originalChildIndex =
        orderedChildrenData[firstSecondaryChildIndex].index;
      return { index: originalChildIndex, align: "right" };
    }
    return noSecondaryChildren;
  }
  let index = orderedChildrenData.length;
  while (index--) {
    if (orderedChildrenData[index].variant === "secondary") {
      return { index: orderedChildrenData[index].index, align: "left" };
    }
  }
  return noSecondaryChildren;
}

export interface ButtonBarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * By default ButtonBar lays buttons from right to left horizontally ordering action buttons by order prop.
   * Use this prop to lay button from left to right instead.
   * Actions buttons will be ordered by alignLeftOrder prop.
   */
  alignLeft?: boolean;
  /**
   * A list of OrderButtons. Required to have some children.
   */
  children: ReactNode;
  /**
   * The className(s) of the component
   */
  className?: string;
  /**
   * By default ButtonBar aligns secondary buttons to the left while displayed horizontally
   * and to the right while aligned left or sorting ascending.
   * Use this prop to disable this behavior.
   */
  disableAutoAlignment?: boolean;
  /**
   * By default ButtonBar sorts buttons in descending order.
   * Use this prop to change that when the button bar is NOT stacked and aligned left.
   */
  sortAlignLeft?: ButtonBarSortOrder;
  /**
   * By default ButtonBar sorts buttons in descending order.
   * Use this prop to change that when the button bar is NOT stacked and NOT aligned left.
   */
  sortOrder?: ButtonBarSortOrder;
  /**
   * By default ButtonBar sorts buttons in descending order.
   * Use this prop to change that when the button bar is stacked.
   */
  sortStackOrder?: ButtonBarSortOrder;
  /**
   * When the viewport is equal to or smaller than the breakpoint the buttons will be stacked vertically.
   * Alternatively pass a screen width number in pixels.
   * Use `0` to disable this feature. Defaults to 'xs'.
   * Actions buttons will be ordered by stackOrder prop.
   */
  stackAtBreakpoint?: "xs" | "sm" | "md" | "lg" | "xl" | number;
}

const withBaseName = makePrefixer("saltButtonBar");

export const ButtonBar = forwardRef<HTMLDivElement, ButtonBarProps>(
  function ButtonBar(
    {
      alignLeft = false,
      children: childrenProp,
      className,
      disableAutoAlignment,
      sortAlignLeft = "desc",
      sortOrder = "desc",
      sortStackOrder = "desc",
      stackAtBreakpoint = "xs",
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-button-bar",
      css: buttonBarCss,
      window: targetWindow,
    });

    const [childrenData, setChildrenData] = useDescendants<OrderedButtonData>();
    // TODO: we need a mechanism to work with breakpoints.
    const matches = false;

    const childrenArray = Children.toArray(childrenProp);
    const childrenIndexes = childrenArray.map((_, index) => index);
    const stackOrderComparator = createComparatorForField(
      "stackOrder",
      sortStackOrder,
      alignLeft,
      childrenData,
    );
    const orderComparator = createComparatorForField(
      "order",
      sortOrder,
      alignLeft,
      childrenData,
    );
    const alignLeftComparator = createComparatorForField(
      "alignLeftOrder",
      sortAlignLeft,
      alignLeft,
      childrenData,
    );

    let orderedChildrenIndexes: number[];

    if (childrenData.length !== childrenIndexes.length) {
      orderedChildrenIndexes = childrenIndexes;
    } else {
      orderedChildrenIndexes = matches
        ? childrenIndexes.sort(stackOrderComparator)
        : childrenIndexes.sort(
            alignLeft ? alignLeftComparator : orderComparator,
          );
    }

    let secondaryChildAlignment: { index?: number; align?: "left" | "right" } =
      {
        index: undefined,
        align: undefined,
      };
    if (!disableAutoAlignment) {
      secondaryChildAlignment = alignSecondaryChild(
        orderedChildrenIndexes.map((index) => ({
          index,
          ...childrenData[index],
        })),
        sortOrder,
        alignLeft,
      );
    }

    const hasSecondaryButtons = childrenData.some(
      (buttonData) => buttonData.variant === "secondary",
    );

    const orderedChildren = orderedChildrenIndexes.map(
      (index) => childrenArray[index],
    );

    const buttonBarContextValue = useMemo(
      () => ({
        matches,
        alignedIndex: secondaryChildAlignment.index,
        align: secondaryChildAlignment.align,
      }),
      [matches, secondaryChildAlignment.align, secondaryChildAlignment.index],
    );

    return (
      <ButtonBarContext.Provider value={buttonBarContextValue}>
        <DescendantProvider items={childrenData} setItems={setChildrenData}>
          <div
            aria-label="button bar"
            className={clsx(
              withBaseName(),
              {
                [withBaseName("stacked")]: matches,
                [withBaseName("alignLeft")]: alignLeft,
                [withBaseName("autoAligning")]:
                  hasSecondaryButtons && !disableAutoAlignment,
              },
              className,
            )}
            ref={ref}
            role="region"
            {...rest}
          >
            {orderedChildren}
          </div>
        </DescendantProvider>
      </ButtonBarContext.Provider>
    );
  },
);
