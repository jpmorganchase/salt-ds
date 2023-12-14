import { MouseEventHandler } from "react";
import { clsx } from "clsx";
import { Button, makePrefixer } from "@salt-ds/core";
import { usePaginationContext } from "./usePaginationContext";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import pageButtonCss from "./PageButton.css";

const withBaseName = makePrefixer("saltPageButton");

export interface PageButtonProps {
  page: number;
  isSelected?: boolean;
  disabled?: boolean;
}

export const PageButton = ({ page, isSelected, disabled }: PageButtonProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-page-button",
    css: pageButtonCss,
    window: targetWindow,
  });

  const { count, onPageChange } = usePaginationContext();
  const name = `Page ${page}`;

  const onClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onPageChange(event, page);
  };

  return (
    <Button
      aria-label={`${name} of ${count}`}
      name={name}
      aria-current={isSelected ? "page" : undefined}
      variant="secondary"
      className={clsx(withBaseName(), {
        [withBaseName("selected")]: isSelected,
        [withBaseName("fixed")]: page < 100,
      })}
      onClick={onClick}
      role="link"
      disabled={disabled}
    >
      {page}
    </Button>
  );
};
