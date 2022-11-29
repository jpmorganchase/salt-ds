import {
  ElementType,
  forwardRef,
  ReactElement,
  PropsWithChildren,
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
} from "react";

type ElementTypeProp<T extends ElementType> = {
  /**
   * Represents the semantic element tag name as a string.
   * Defaults to 'div'
   */
  elementType?: ElementType;
};

type PropsToOmit<T extends ElementType, P> = keyof (ElementTypeProp<T> & P);

type PolymorphicComponentProp<T extends ElementType, Props> = PropsWithChildren<
  Props & ElementTypeProp<T>
> &
  Omit<ComponentPropsWithoutRef<T>, PropsToOmit<T, Props>>;

export type PolymorphicRef<T extends ElementType> =
  ComponentPropsWithRef<T>["ref"];

export type PolymorphicComponentPropWithRef<
  T extends ElementType,
  Props
> = PolymorphicComponentProp<T, Props> & { ref?: PolymorphicRef<T> };
