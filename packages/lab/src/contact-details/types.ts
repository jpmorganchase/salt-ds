import { HTMLAttributes } from "react";

export interface ValueComponentProps extends HTMLAttributes<HTMLSpanElement> {
  value?: string;
}
