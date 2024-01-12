import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, MouseEventHandler } from "react";
import { Button, makePrefixer } from "@salt-ds/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@salt-ds/icons";
import { PageRanges } from "./PageRanges";
import { usePaginationContext } from "./usePaginationContext";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import paginatorCss from "./Paginator.css";

const withBaseName = makePrefixer("saltPaginator");

export interface PaginatorProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Number of pages next to the arrow buttons when page range is truncated.
   */
  boundaryCount?: number;
  /**
   * Number of pages on each side of the current page when page range is truncated.
   */
  siblingCount?: number;
}

export const Paginator = forwardRef<HTMLDivElement, PaginatorProps>(
  function Paginator(
    { className, boundaryCount, siblingCount, ...restProps },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-paginator",
      css: paginatorCss,
      window: targetWindow,
    });

    const { count, page, onPageChange } = usePaginationContext();

    const onPreviousPage: MouseEventHandler<HTMLButtonElement> = (event) => {
      onPageChange(event, Math.max(1, page - 1));
    };

    const onNextPage: MouseEventHandler<HTMLButtonElement> = (event) => {
      onPageChange(event, Math.min(page + 1, count));
    };

    const isOnFirstPage = page === 1;
    const isOnLastPage = page === count;

    return (
      <div className={clsx(withBaseName(), className)} {...restProps} ref={ref}>
        <Button
          variant="secondary"
          aria-label="Previous Page"
          onClick={onPreviousPage}
          disabled={isOnFirstPage}
          className={withBaseName("arrowButton-previous")}
        >
          <ChevronLeftIcon aria-hidden />
        </Button>
        <PageRanges siblingCount={siblingCount} boundaryCount={boundaryCount} />
        <Button
          variant="secondary"
          aria-label="Next Page"
          onClick={onNextPage}
          disabled={isOnLastPage}
          className={withBaseName("arrowButton-next")}
        >
          <ChevronRightIcon aria-hidden />
        </Button>
      </div>
    );
  }
);
