import { useForkRef } from "@salt-ds/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, useCallback } from "react";
import { ArrowButton } from "./ArrowButton";
import { CompactControls } from "./CompactControls";
import { RegularControls } from "./RegularControls";
import { usePaginationContext } from "./usePaginationContext";
import { withBaseName } from "./utils";
import { FormFieldLegacyProps as FormFieldProps } from "../form-field-legacy";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import paginationCss from "./Pagination.css";

export interface PaginatorProps extends HTMLAttributes<HTMLDivElement> {
  boundaryCount?: number;
  siblingCount?: number;
  showPreviousNext?: boolean;
  FormFieldProps?: Partial<FormFieldProps>;
}

export const Paginator = forwardRef<HTMLDivElement, PaginatorProps>(
  function Paginator(
    {
      className,
      boundaryCount,
      siblingCount,
      showPreviousNext = true,
      FormFieldProps,
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

    const {
      count,
      page,
      onPageChange,
      compact,
      setPaginatorElement,
      withInput,
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
      <div className={clsx(withBaseName(), className)} {...restProps} ref={ref}>
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
            withInput={withInput}
            onPageChange={onPageChange}
            FormFieldProps={FormFieldProps}
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
