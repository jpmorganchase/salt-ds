import type { HTMLAttributes } from "react";

// Purely used as markers, props will be extracted
/**
 * @deprecated since 1.0.0-alpha.110. Use `ListBox` from `@salt-ds/core` instead.
 */
export interface ListItemHeaderProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}
/**
 * @deprecated since 1.0.0-alpha.110. Use `ListBox` from `@salt-ds/core` instead.
 */
export const ListItemHeader = (_: ListItemHeaderProps) => null;
