import { ComponentPropsWithoutRef } from "react";
import { FlexLayout } from "@jpmorganchase/uitk-core";

export type LayoutDirection = "row" | "column";

export type LayoutSeparator = "start" | "center" | "end";

export type FlexLayoutProps = ComponentPropsWithoutRef<typeof FlexLayout>;
