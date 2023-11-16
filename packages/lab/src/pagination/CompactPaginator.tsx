import { ComponentPropsWithoutRef, forwardRef, useCallback } from "react";
import { clsx } from "clsx";
import { ChevronLeftIcon, ChevronRightIcon } from "@salt-ds/icons";
import { ArrowButton } from "./ArrowButton";
import { CompactInput } from "./CompactInput";
import { PageButton } from "./PageButton";
import { withBaseName } from "./utils";
import { usePaginationContext } from "./usePaginationContext";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import paginationCss from "./Pagination.css";

interface CompactPaginatorProps extends ComponentPropsWithoutRef<"div"> {
  withInput?: boolean;
}

export const CompactPaginator = forwardRef<
  HTMLDivElement,
  CompactPaginatorProps
>(function CompactPaginator({ className, withInput, ...restProps }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-pagination",
    css: paginationCss,
    window: targetWindow,
  });

  const { count, page, onPageChange } = usePaginationContext();

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
      <ArrowButton
        arrowButtonType="previous"
        onPress={onPreviousPage}
        disabled={isOnFirstPage}
      >
        <ChevronLeftIcon />
      </ArrowButton>
      {withInput ? (
        <CompactInput />
      ) : (
        <PageButton page={page} onPageChange={onPageChange} disabled />
      )}
      <span className={withBaseName("compactSeparator")}>of</span>
      <PageButton
        page={count}
        onPageChange={onPageChange}
        disabled={page === count}
      />
      <ArrowButton
        arrowButtonType="next"
        onPress={onNextPage}
        disabled={isOnLastPage}
      >
        <ChevronRightIcon />
      </ArrowButton>
    </div>
  );
});
