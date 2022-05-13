import { ComponentPropsWithoutRef } from "react";
import { FlexLayout } from "./FlexLayout";

export type LayoutDirection = "row" | "column";

export type LayoutSeparator = "start" | "center" | "end";

export type FlexLayoutProps = ComponentPropsWithoutRef<typeof FlexLayout>;
