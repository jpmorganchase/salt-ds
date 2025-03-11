import { GridLayout } from "@salt-ds/core";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface ArticleCardsProps
  extends ComponentPropsWithoutRef<typeof GridLayout> {
  children?: ReactNode;
}

export function ArticleCards({ children, ...rest }: ArticleCardsProps) {
  return <GridLayout {...rest}>{children}</GridLayout>;
}
