import { ComponentPropsWithoutRef, forwardRef, useCallback } from "react";
import { clsx } from "clsx";
import { useForkRef, Text } from "@salt-ds/core";
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
  /**
   * Id of the input field
   */
  id?: string;
  /**
   * Change input variant.
   */
  inputVariant?: "primary" | "secondary";
  /**
   * Display an input field in place of the current page.
   */
  withInput?: boolean;
}

export const CompactPaginator = forwardRef<
  HTMLDivElement,
  CompactPaginatorProps
>(function CompactPaginator(
  { className, id, inputVariant, withInput, ...restProps },
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
      {withInput ? (
        <CompactInput id={id} variant={inputVariant} />
      ) : (
        <PageButton page={page} onPageChange={onPageChange} disabled />
      )}
      <Text
        as="span"
        variant="secondary"
        className={withBaseName("compactSeparator")}
      >
        of
      </Text>
      <PageButton
        page={count}
        onPageChange={onPageChange}
        disabled={isOnLastPage}
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
});
