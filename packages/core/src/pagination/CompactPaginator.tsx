import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEventHandler,
} from "react";
import { Button } from "../button";
import { useIcon } from "../semantic-icon-provider";
import { Text } from "../text";
import { makePrefixer } from "../utils";
import compactPaginatorCss from "./CompactPaginator.css";
import { PageButton } from "./PageButton";
import { usePaginationContext } from "./usePaginationContext";

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

  const { NextIcon, PreviousIcon } = useIcon();

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
        appearance="transparent"
        aria-label="Previous Page"
        onClick={onPreviousPage}
        disabled={isOnFirstPage}
        className={withBaseName("arrowButton")}
      >
        <PreviousIcon aria-hidden />
      </Button>
      {children ? children : <PageButton page={page} disabled />}
      <Text as="span" variant="secondary">
        of
      </Text>
      <PageButton page={count} disabled={isOnLastPage} />
      <Button
        appearance="transparent"
        aria-label="Next Page"
        onClick={onNextPage}
        disabled={isOnLastPage}
        className={withBaseName("arrowButton")}
      >
        <NextIcon aria-hidden />
      </Button>
    </div>
  );
});
