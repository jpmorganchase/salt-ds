import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type MouseEventHandler } from "react";
import { Button } from "../button";
import { useIcon } from "../semantic-icon-provider";
import { makePrefixer } from "../utils";
import { PageRanges } from "./PageRanges";
import paginatorCss from "./Paginator.css";
import { usePaginationContext } from "./usePaginationContext";

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
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-paginator",
      css: paginatorCss,
      window: targetWindow,
    });

    const { count, page, onPageChange } = usePaginationContext();
    const { NextIcon, PreviousIcon } = useIcon();

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
          appearance="transparent"
          aria-label="Previous Page"
          onClick={onPreviousPage}
          disabled={isOnFirstPage}
          className={withBaseName("arrowButton-previous")}
        >
          <PreviousIcon aria-hidden />
        </Button>
        <PageRanges siblingCount={siblingCount} boundaryCount={boundaryCount} />
        <Button
          appearance="transparent"
          aria-label="Next Page"
          onClick={onNextPage}
          disabled={isOnLastPage}
          className={withBaseName("arrowButton-next")}
        >
          <NextIcon aria-hidden />
        </Button>
      </div>
    );
  },
);
