import type { AnchorHTMLAttributes, DetailedHTMLProps } from "react";

export type inferElementType<T> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T] extends DetailedHTMLProps<
      AnchorHTMLAttributes<any>,
      infer Elem
    >
    ? Elem
    : never
  : HTMLElement;
