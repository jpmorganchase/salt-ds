import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import "./Card.css";

const withBaseName = makePrefixer("saltCard");

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * If `true`, the card will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, interactive styles will be applied to `Card`. These styles give prominence to certain content
   * on the page.
   */
  interactable?: boolean;
}

/**
 * Card component is a sheet if material that serves as an entry point to more detailed information.
 * Cards display content composed of different elements whose size or supported actions vary.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  props,
  ref
) {
  const { className, disabled, interactable, children, ...rest } = props;

  return (
    <div
      className={clsx(
        withBaseName(),
        {
          [withBaseName("disabled")]: disabled,
          [withBaseName("interactable")]: interactable,
        },
        className
      )}
      ref={ref}
      {...rest}
    >
      <div className={withBaseName("content")}>{children}</div>
    </div>
  );
});
