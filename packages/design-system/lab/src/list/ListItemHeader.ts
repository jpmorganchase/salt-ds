import { HTMLAttributes } from "react";

// Purely used as markers, props will be extracted
export interface ListItemHeaderProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}
export const ListItemHeader = (_: ListItemHeaderProps) => null;
