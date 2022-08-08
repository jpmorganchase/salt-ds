import { HTMLAttributes } from "react";

export * from "./FavoriteToggleWithTooltip";
export * from "./ContactDetailsContext";
export * from "./useComponentSize";

export interface ValueComponentProps extends HTMLAttributes<HTMLSpanElement> {
  value?: string;
}
