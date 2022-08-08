import { ComponentPropsWithRef, ElementType } from "react";

export type polymorphicRef<C extends ElementType> =
  ComponentPropsWithRef<C>["ref"];
