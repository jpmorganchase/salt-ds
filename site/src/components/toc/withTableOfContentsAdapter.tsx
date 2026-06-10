import { useTableOfContents } from "@jpmorganchase/mosaic-store";
import type { ComponentType } from "react";
import type { TableOfContentsProps } from "./TableOfContents";

export const withTableOfContentsAdapter =
  (Component: ComponentType<TableOfContentsProps>) =>
  ({ items, ...rest }: TableOfContentsProps) => {
    const { tableOfContents } = useTableOfContents();
    return <Component items={items ?? tableOfContents} {...rest} />;
  };
