import { ComponentPropsWithoutRef, forwardRef, useCallback } from "react";
import { clsx } from "clsx";
import { useForkRef, Text } from "@salt-ds/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@salt-ds/icons";
import { ArrowButton } from "./ArrowButton";
import { PageButton } from "./PageButton";
import { withBaseName } from "./utils";
import { usePaginationContext } from "./usePaginationContext";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import paginationCss from "./Pagination.css";

export const CompactPaginator = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(function CompactPaginator(
  { children, className, ...restProps },
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
      <ArrowButton
        arrowButtonType="previous"
        onClick={onPreviousPage}
        disabled={isOnFirstPage}
      >
        <ChevronLeftIcon />
      </ArrowButton>
      {children ? children : <PageButton page={page} disabled />}
      <Text
        as="span"
        variant="secondary"
        className={withBaseName("compactSeparator")}
      >
        of
      </Text>
      <PageButton page={count} disabled={isOnLastPage} />
      <ArrowButton
        arrowButtonType="next"
        onClick={onNextPage}
        disabled={isOnLastPage}
      >
        <ChevronRightIcon />
      </ArrowButton>
    </div>
  );
});
