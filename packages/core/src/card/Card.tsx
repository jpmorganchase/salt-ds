import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import "./Card.css";

const withBaseName = makePrefixer("saltCard");
export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * **Deprecated:** Use the InteractableCard component instead
   *
   * If `true`, the card will be disabled.
   */
  disabled?: boolean;
  /**
   * **Deprecated:** Use the InteractableCard component instead
   *
   * If `true`, interactive styles will be applied to `Card`. These styles give prominence to certain content
   * on the page.
   */
  interactable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  props,
  ref
) {
  const { className, children, disabled, interactable, ...rest } = props;
  return (
    <div
      className={clsx(
        withBaseName(),
        {
          /* **Deprecated:** InteractableCard should be used instead for these features */
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
