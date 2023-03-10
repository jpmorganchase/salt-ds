import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import "./Card.css";

const withBaseName = makePrefixer("saltCard");

export interface InteractableCardProps extends Omit<ComponentPropsWithoutRef<"div">, "onClick"> {
  /**
   * If `true`, the card will be disabled.
   */
  disabled?: boolean; /**
  * Action called on click.
  */
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

export const InteractableCard = forwardRef<
  HTMLDivElement,
  InteractableCardProps
>(function Card(props, ref) {
  const { className, disabled, onClick, children, ...rest } = props;

  return (
    <div
      className={clsx(
        withBaseName(),
        withBaseName("interactable"),
        {
          [withBaseName("disabled")]: disabled,
        },
        className
      )}
      onClick={onClick}
      ref={ref}
      {...rest}
    >
      <div className={withBaseName("content")}>{children}</div>
    </div>
  );
});
