import {
  ElementType,
  PropsWithChildren,
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
} from "react";

type AsProp = {
  /**
   * Represents the semantic element tag name as a string.
   * Defaults to 'div'
   */
  as?: ElementType;
};

type PropsToOmit<T extends ElementType, P> = keyof (AsProp & P);

type PolymorphicComponentProp<T extends ElementType, Props> = PropsWithChildren<
  Props & AsProp
> &
  Omit<ComponentPropsWithoutRef<T>, PropsToOmit<T, Props>>;

export type PolymorphicRef<T extends ElementType> =
  ComponentPropsWithRef<T>["ref"];

export type PolymorphicComponentPropWithRef<
  T extends ElementType,
  Props
> = PolymorphicComponentProp<T, Props> & { ref?: PolymorphicRef<T> };
