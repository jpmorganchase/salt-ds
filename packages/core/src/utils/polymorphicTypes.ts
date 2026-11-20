import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  PropsWithChildren,
} from "react";

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
  Props,
> = PolymorphicComponentProp<T, Props> & {
  /**
   * A ref to the rendered element, whose type depends on `as`.
   */
  ref?: PolymorphicRef<T>;
};
