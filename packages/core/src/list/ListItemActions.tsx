import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type DOMAttributes,
  type ElementType,
  forwardRef,
  type ReactNode,
} from "react";
import { makePrefixer } from "../utils";
import listItemActionsCss from "./ListItemActions.css";

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
> & { children?: ReactNode };

export type ListItemActionsProps = StructuralComponentProps<"div"> & {
  /**
   * Name multiple related controls as a group when the relationship needs to
   * be announced.
   */
  role?: "group";
};

const withBaseName = makePrefixer("saltCoreListItemActions");

/**
 * A trailing region for controls that are independent from the primary row
 * content or action.
 */
export const ListItemActions = forwardRef<HTMLDivElement, ListItemActionsProps>(
  function ListItemActions({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-core-list-item-actions",
      css: listItemActionsCss,
      window: targetWindow,
    });

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        {children}
      </div>
    );
  },
);
