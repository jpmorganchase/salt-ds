import type { HTMLAttributes, ReactElement } from "react";

// Purely used as markers, props will be extracted
/**
 * @deprecated since 1.0.0-alpha.110. Use `ListBox` from `@salt-ds/core` instead.
 */
export interface ListItemGroupProps extends HTMLAttributes<HTMLDivElement> {
  //   children?: ListItemType | ListItemType[];
  children?: ReactElement | ReactElement[];
  label?: string;
}
/**
 * @deprecated since 1.0.0-alpha.110. Use `ListBox` from `@salt-ds/core` instead.
 */
export const ListItemGroup = (_: ListItemGroupProps) => null;
