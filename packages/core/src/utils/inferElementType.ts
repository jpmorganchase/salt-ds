import type { AnchorHTMLAttributes, DetailedHTMLProps } from "react";

export type inferElementType<T> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T] extends DetailedHTMLProps<
      // biome-ignore lint/suspicious/noExplicitAny: any is simpler here
      AnchorHTMLAttributes<any>,
      infer Elem
    >
    ? Elem
    : never
  : HTMLElement;
