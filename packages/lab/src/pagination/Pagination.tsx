import {
  forwardRef,
  HTMLAttributes,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { clsx } from "clsx";
import { makePrefixer, useAriaAnnouncer, useControlled } from "@salt-ds/core";
import { PaginationContext, paginationContext } from "./PaginationContext";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import paginationCss from "./Pagination.css";

const withBaseName = makePrefixer("saltPagination");

const { Provider } = paginationContext;

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  /**
   * Number of pages.
   */
  count: number;
  /**
   * Current/active page.
   */
  page?: number;
  /**
   * Default current/active page.
   */
  defaultPage?: number;
  /**
   * Callback function triggered when current page changed.
   */
  onPageChange?: (event: SyntheticEvent, page: number) => void;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      className,
      count,
      children,
      defaultPage = 1,
      page: pageProp,
      onPageChange: onPageChangeProp,
      ...restProps
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-pagination",
      css: paginationCss,
      window: targetWindow,
    });

    const [pageState, setPageState] = useControlled({
      controlled: pageProp,
      default: defaultPage,
      name: "Pagination",
      state: "page",
    });

    const onPageChange = useCallback(
      (event: SyntheticEvent, page: number) => {
        setPageState(page);
        onPageChangeProp && onPageChangeProp(event, page);
      },
      [onPageChangeProp, setPageState]
    );

    const contextValue: PaginationContext = useMemo(
      () => ({
        page: pageState,
        count,
        onPageChange,
      }),
      [pageState, count, onPageChange]
    );

    const { announce } = useAriaAnnouncer();
    const mounted = useRef<boolean>(false);

    useEffect(() => {
      if (mounted.current) {
        announce(`Page ${pageState}`);
      } else {
        mounted.current = true;
      }
    }, [announce, pageState]);

    if (count < 2) {
      return null;
    }

    return (
      <Provider value={contextValue}>
        <nav
          className={clsx(withBaseName(), className)}
          ref={ref}
          {...restProps}
        >
          {children}
        </nav>
      </Provider>
    );
  }
);
