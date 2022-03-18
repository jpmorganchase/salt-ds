import { forwardRef, HTMLAttributes, useCallback } from "react";
import cn from "classnames";
import { ChevronLeftIcon, ChevronRightIcon } from "@brandname/icons";
import "./Pagination.css";
import { withBaseName } from "./utils";
import { usePaginationContext } from "./usePaginationContext";
import { RegularControls } from "./RegularControls";
import { ArrowButton } from "./ArrowButton";
import { CompactControls } from "./CompactControls";
import { useForkRef } from "../utils";

export interface PaginatorProps extends HTMLAttributes<HTMLDivElement> {
  boundaryCount?: number;
  siblingCount?: number;
  showPreviousNext?: boolean;
}

export const Paginator = forwardRef<HTMLDivElement, PaginatorProps>(
  (
    {
      className,
      boundaryCount,
      siblingCount,
      showPreviousNext = true,
      ...restProps
    },
    forwardedRef
  ) => {
    const {
      count,
      page,
      onPageChange,
      emphasis,
      compact,
      setPaginatorElement,
    } = usePaginationContext();

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
      <div className={cn(withBaseName(), className)} {...restProps} ref={ref}>
        {showPreviousNext && (
          <ArrowButton
            arrowButtonType="previous"
            onPress={onPreviousPage}
            disabled={isOnFirstPage}
          >
            <ChevronLeftIcon />
          </ArrowButton>
        )}
        {compact ? (
          <CompactControls
            count={count}
            page={page}
            onPageChange={onPageChange}
            emphasis={emphasis}
          />
        ) : (
          <RegularControls
            count={count}
            page={page}
            onPageChange={onPageChange}
            siblingCount={siblingCount}
            boundaryCount={boundaryCount}
          />
        )}
        {showPreviousNext && (
          <ArrowButton
            arrowButtonType="next"
            onPress={onNextPage}
            disabled={isOnLastPage}
          >
            <ChevronRightIcon />
          </ArrowButton>
        )}
      </div>
    );
  }
);
