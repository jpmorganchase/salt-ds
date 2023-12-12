import { useForkRef } from "@salt-ds/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, MouseEventHandler } from "react";
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
  siblingPairCount?: number;
}

export const Paginator = forwardRef<HTMLDivElement, PaginatorProps>(
  function Paginator(
    { className, boundaryCount, siblingPairCount, ...restProps },
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

    console.log("Paginator - page", page);

    const ref = useForkRef(setPaginatorElement, forwardedRef);

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
        <ArrowButton
          arrowButtonType="previous"
          onClick={onPreviousPage}
          disabled={isOnFirstPage}
        >
          <ChevronLeftIcon />
        </ArrowButton>
        <RegularControls
          siblingPairCount={siblingPairCount}
          boundaryCount={boundaryCount}
        />
        <ArrowButton
          arrowButtonType="next"
          onClick={onNextPage}
          disabled={isOnLastPage}
        >
          <ChevronRightIcon />
        </ArrowButton>
      </div>
    );
  }
);
