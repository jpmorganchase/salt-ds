import { ComponentPropsWithoutRef, forwardRef, MouseEventHandler } from "react";
import { clsx } from "clsx";
import { Button, Text, makePrefixer } from "@salt-ds/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@salt-ds/icons";
import { PageButton } from "./PageButton";
import { usePaginationContext } from "./usePaginationContext";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import compactPaginatorCss from "./CompactPaginator.css";

const withBaseName = makePrefixer("saltCompactPaginator");

export const CompactPaginator = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(function CompactPaginator({ children, className, ...restProps }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-compact-paginator",
    css: compactPaginatorCss,
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
        className={withBaseName("arrowButton")}
      >
        <ChevronLeftIcon aria-hidden />
      </Button>
      {children ? children : <PageButton page={page} disabled />}
      <Text as="span" variant="secondary">
        of
      </Text>
      <PageButton page={count} disabled={isOnLastPage} />
      <Button
        variant="secondary"
        aria-label="Next Page"
        onClick={onNextPage}
        disabled={isOnLastPage}
        className={withBaseName("arrowButton")}
      >
        <ChevronRightIcon aria-hidden />
      </Button>
    </div>
  );
});
