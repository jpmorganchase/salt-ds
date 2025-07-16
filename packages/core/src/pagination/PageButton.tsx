import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type MouseEventHandler } from "react";
import { makePrefixer } from "../utils";
import pageButtonCss from "./PageButton.css";
import { usePaginationContext } from "./usePaginationContext";

const withBaseName = makePrefixer("saltPageButton");

export interface PageButtonProps {
  page: number;
  selected?: boolean;
  disabled?: boolean;
}
export const PageButton = forwardRef<HTMLButtonElement, PageButtonProps>(
  function PageButton({ page, selected, disabled }: PageButtonProps, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-page-button",
      css: pageButtonCss,
      window: targetWindow,
    });

    const { count, onPageChange } = usePaginationContext();

    const onClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      onPageChange(event, page);
    };

    return (
      <button
        aria-label={`Page ${page} of ${count}`}
        aria-current={selected ? "page" : undefined}
        className={clsx(withBaseName(), {
          [withBaseName("selected")]: selected,
          [withBaseName("fixed")]: page < 100,
        })}
        onClick={onClick}
        disabled={disabled}
        ref={ref}
        type="button"
      >
        {page}
      </button>
    );
  },
);
