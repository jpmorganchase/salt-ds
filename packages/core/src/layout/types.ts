import {
  ElementType,
  PropsWithChildren,
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
} from "react";

export const LAYOUT_DIRECTION = ["row", "column"] as const;
export type LayoutDirection = typeof LAYOUT_DIRECTION[number];
export type LayoutSeparator = "start" | "center" | "end";
export type LayoutAnimation = "slide" | "fade";
export type LayoutAnimationDirection = "horizontal" | "vertical";
export type LayoutAnimationTransition = "increase" | "decrease";

type AsProp<T extends ElementType> = {
  /**
   * The HTML element used for the root node.
   */
  as?: T;
};

type PropsToOmit<T extends ElementType, P> = keyof (AsProp<T> & P);

type PolymorphicComponentProp<T extends ElementType, Props> = PropsWithChildren<
  Props & AsProp<T>
> &
  Omit<ComponentPropsWithoutRef<T>, PropsToOmit<T, Props>>;

export type PolymorphicRef<T extends ElementType> =
  ComponentPropsWithRef<T>["ref"];

export type PolymorphicComponentPropWithRef<
  T extends ElementType,
  Props
> = PolymorphicComponentProp<T, Props> & { ref?: PolymorphicRef<T> };
