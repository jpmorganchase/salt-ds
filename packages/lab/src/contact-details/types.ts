import type { HTMLAttributes } from "react";

export interface ValueComponentProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  value?: string;
}
