import { Button, ButtonProps } from "@salt-ds/core";
import { ChevronLeftIcon, ChevronRightIcon, IconProps } from "@salt-ds/icons";
import { clsx } from "clsx";
import { ComponentType } from "react";
import { withBaseName } from "./utils";

export type ArrowButtonType = "previous" | "next";

export interface ArrowButtonProps extends ButtonProps {
  arrowButtonType: ArrowButtonType;
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

export const ArrowButton = ({
  arrowButtonType,
  disabled,
  ...restProps
}: ArrowButtonProps) => {
  const { icon: Icon, name, className } = contentByType.get(arrowButtonType)!;

  return (
    <Button
      variant="secondary"
      className={clsx(withBaseName("arrowButton"), className)}
      role="link"
      name={name}
      aria-label={name}
      disabled={disabled}
      {...restProps}
    >
      <Icon aria-label={name} />
    </Button>
  );
};
