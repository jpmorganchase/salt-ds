import { ElementType, forwardRef } from "react";
import {
  Button,
  ButtonProps,
  makePrefixer,
  polymorphicRef,
} from "@jpmorganchase/uitk-core";
import "./ToolbarButton.css";
import { ToolbarItemProps } from "./toolbar-field";
import cx from "classnames";

export type ToolbarButtonProps<T extends ElementType = "button"> =
  ButtonProps<T> & {
    label?: string;
  } & ToolbarItemProps;

const withBaseName = makePrefixer("uitkToolbarButton");

export const ToolbarButton = forwardRef(function ToolbarButton<
  T extends ElementType = "button"
>(
  {
    className: classNameProp,
    label,
    inOverflowPanel,
    orientation,
    ...props
  }: ToolbarButtonProps<T>,
  forwardedRef: polymorphicRef<T>
) {
  const className = cx(withBaseName(), classNameProp, {
    [withBaseName("overflowed")]: inOverflowPanel,
    [withBaseName("vertical")]: orientation === "vertical",
  });

  return (
    <Button
      variant="secondary"
      {...props}
      className={className}
      data-overflow-label={label}
      ref={forwardedRef}
    />
  );
});
