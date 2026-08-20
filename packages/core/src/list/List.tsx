import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type DOMAttributes,
  type ElementType,
  type ForwardedRef,
  forwardRef,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from "react";
import { makePrefixer } from "../utils";
import listCss from "./List.css";

type ListElement = "ol" | "ul";
// HTMLOListElement structurally extends HTMLUListElement. Excluding its unique
// fields keeps an ordered-list ref from being accepted for the default ul.
type UnorderedListElement = HTMLUListElement & {
  readonly reversed?: never;
  readonly start?: never;
};

type StructuralComponentProps<T extends ElementType> = Omit<
  ComponentPropsWithoutRef<T>,
  | keyof DOMAttributes<Element>
  | "accessKey"
  | "autoFocus"
  | "contentEditable"
  | "draggable"
  | "role"
  | "suppressContentEditableWarning"
  | "tabIndex"
> & {
  children?: ReactNode;
};

type ListUnorderedOwnProps = StructuralComponentProps<"ul"> & {
  as?: "ul";
  reversed?: never;
  start?: never;
};

type ListOrderedOwnProps = StructuralComponentProps<"ol"> & {
  /**
   * Render an ordered list instead of the default unordered list.
   */
  as: "ol";
};

type ListUnorderedProps = ListUnorderedOwnProps &
  RefAttributes<UnorderedListElement>;
type ListOrderedProps = ListOrderedOwnProps & RefAttributes<HTMLOListElement>;

export type ListProps<T extends ListElement = ListElement> = T extends "ol"
  ? ListOrderedProps
  : ListUnorderedProps;

interface ListComponent {
  (props: ListUnorderedProps): ReactElement | null;
  (props: ListOrderedProps): ReactElement | null;
  (props: ListProps): ReactElement | null;
}

const withBaseName = makePrefixer("saltCoreList");

/**
 * A structural list for passive and independently actionable rows.
 */
function ListImpl(
  props: ListUnorderedOwnProps | ListOrderedOwnProps,
  ref: ForwardedRef<HTMLOListElement | HTMLUListElement>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-core-list",
    css: listCss,
    window: targetWindow,
  });

  if (props.as === "ol") {
    const { as: _as, children, className, ...rest } = props;

    return (
      <ol
        className={clsx(withBaseName(), className)}
        ref={ref as ForwardedRef<HTMLOListElement>}
        {...rest}
      >
        {children}
      </ol>
    );
  }

  const { as: _as, children, className, ...rest } = props;

  return (
    <ul
      className={clsx(withBaseName(), className)}
      ref={ref as ForwardedRef<HTMLUListElement>}
      {...rest}
    >
      {children}
    </ul>
  );
}

export const List = forwardRef(ListImpl) as ListComponent;
