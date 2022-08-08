import type { DetailedHTMLProps, AnchorHTMLAttributes } from "react";

export type inferElementType<T> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T] extends DetailedHTMLProps<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      AnchorHTMLAttributes<any>,
      infer Elem
    >
    ? Elem
    : never
  : HTMLElement;
