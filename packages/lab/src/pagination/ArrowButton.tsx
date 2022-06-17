import { Button, ButtonProps } from "@jpmorganchase/uitk-core";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  IconProps,
} from "@jpmorganchase/uitk-icons";
import cn from "classnames";
import {
  ComponentType,
  FC,
  KeyboardEventHandler,
  MouseEventHandler,
} from "react";
import { withBaseName } from "./utils";

export type ArrowButtonType = "previous" | "next";

export interface ArrowButtonProps extends ButtonProps {
  arrowButtonType: ArrowButtonType;
  onPress: () => void;
}

interface ButtonContent {
  icon: ComponentType<IconProps>;
  name: string;
  className: string;
}

const contentByType = new Map<ArrowButtonType, ButtonContent>([
  [
    "previous",
    {
      icon: ChevronLeftIcon,
      name: "Previous Page",
      className: withBaseName("previousButton"),
    },
  ],
  [
    "next",
    {
      icon: ChevronRightIcon,
      name: "Next Page",
      className: withBaseName("nextButton"),
    },
  ],
]);

export const ArrowButton: FC<ArrowButtonProps> = ({
  arrowButtonType,
  onPress,
  onKeyDown: onKeyDownProp,
  onClick: onClickProp,
  ...restProps
}) => {
  const { icon: Icon, name, className } = contentByType.get(arrowButtonType)!;

  const onKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onPress();
    }
    onKeyDownProp && onKeyDownProp(event);
  };

  const onClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onPress();
    onClickProp && onClickProp(event);
  };

  return (
    <Button
      {...restProps}
      variant="secondary"
      className={cn(withBaseName("arrowButton"), className)}
      role="link"
      name={name}
      aria-label={name}
      onKeyDown={onKeyDown}
      onClick={onClick}
    >
      <Icon aria-label={name} />
    </Button>
  );
};
