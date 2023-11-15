import { KeyboardEventHandler, MouseEventHandler } from "react";
import { withBaseName } from "./utils";
import { Button } from "@salt-ds/core";
import { clsx } from "clsx";

export interface PageButtonProps {
  page: number;
  isSelected?: boolean;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const PageButton = ({
  page,
  isSelected,
  onPageChange,
  disabled,
}: PageButtonProps) => {
  const name = `Page ${page}`;

  const onKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    if (event.key === "Enter") {
      onPageChange(page);
    }
  };

  const onClick: MouseEventHandler<HTMLButtonElement> = () => {
    onPageChange(page);
  };

  return (
    <Button
      aria-label={name}
      name={name}
      aria-current={isSelected ? "page" : undefined}
      variant="secondary"
      className={clsx(withBaseName("pageButton"), {
        [withBaseName("readonly")]: disabled,
        [withBaseName("pageButtonSelected")]: isSelected,
        [withBaseName("pageButtonFixed")]: page < 100,
      })}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="link"
      disabled={disabled}
    >
      {page}
    </Button>
  );
};
