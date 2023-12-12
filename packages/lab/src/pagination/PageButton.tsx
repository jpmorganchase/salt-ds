import { MouseEventHandler } from "react";
import { Button } from "@salt-ds/core";
import { clsx } from "clsx";
import { usePaginationContext } from "./usePaginationContext";
import { withBaseName } from "./utils";

export interface PageButtonProps {
  page: number;
  isSelected?: boolean;
  disabled?: boolean;
}

export const PageButton = ({ page, isSelected, disabled }: PageButtonProps) => {
  const { onPageChange } = usePaginationContext();
  const name = `Page ${page}`;

  const onClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onPageChange(event, page);
  };

  return (
    <Button
      aria-label={name}
      name={name}
      aria-current={isSelected ? "page" : undefined}
      variant="secondary"
      className={clsx(withBaseName("pageButton"), {
        [withBaseName("pageButtonReadonly")]: disabled,
        [withBaseName("pageButtonSelected")]: isSelected,
        [withBaseName("pageButtonFixed")]: page < 100,
      })}
      onClick={onClick}
      role="link"
      disabled={disabled}
    >
      {page}
    </Button>
  );
};
