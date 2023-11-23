import { useForkRef } from "@salt-ds/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, useCallback } from "react";
import { ArrowButton } from "./ArrowButton";
import { RegularControls } from "./RegularControls";
import { usePaginationContext } from "./usePaginationContext";
import { withBaseName } from "./utils";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import paginationCss from "./Pagination.css";

export interface PaginatorProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Number of pages next to the arrow buttons when page range is truncated.
   */
  boundaryCount?: number;
  /**
   * Number of pages on each side of the current page when page range is truncated.
   */
  siblingCount?: number;
  /**
   * Display arrow buttons.
   */
  showPreviousNext?: boolean;
}

export const Paginator = forwardRef<HTMLDivElement, PaginatorProps>(
  function Paginator(
    {
      className,
      boundaryCount,
      siblingCount,
      showPreviousNext = true,
      ...restProps
    },
    forwardedRef
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-pagination",
      css: paginationCss,
      window: targetWindow,
    });

    const { count, page, onPageChange, setPaginatorElement } =
      usePaginationContext();

    const ref = useForkRef(setPaginatorElement, forwardedRef);

    const onPreviousPage = useCallback(() => {
      onPageChange(Math.max(1, page - 1));
    }, [page, onPageChange]);

    const onNextPage = useCallback(() => {
      onPageChange(Math.min(page + 1, count));
    }, [page, onPageChange, count]);

    const isOnFirstPage = page === 1;

    const isOnLastPage = page === count;

    return (
      <div className={clsx(withBaseName(), className)} {...restProps} ref={ref}>
        {showPreviousNext && (
          <ArrowButton
            arrowButtonType="previous"
            onClick={onPreviousPage}
            disabled={isOnFirstPage}
          >
            <ChevronLeftIcon />
          </ArrowButton>
        )}
        <RegularControls
          count={count}
          page={page}
          onPageChange={onPageChange}
          siblingCount={siblingCount}
          boundaryCount={boundaryCount}
        />
        {showPreviousNext && (
          <ArrowButton
            arrowButtonType="next"
            onClick={onNextPage}
            disabled={isOnLastPage}
          >
            <ChevronRightIcon />
          </ArrowButton>
        )}
      </div>
    );
  }
);
