import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type HTMLAttributes,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAriaAnnouncer } from "../aria-announcer";
import { makePrefixer, useControlled } from "../utils";
import paginationCss from "./Pagination.css";
import { type PaginationContext, paginationContext } from "./PaginationContext";

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
    ref,
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
        onPageChangeProp?.(event, page);
      },
      [onPageChangeProp],
    );

    const contextValue: PaginationContext = useMemo(
      () => ({
        page: pageState,
        count,
        onPageChange,
      }),
      [pageState, count, onPageChange],
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
  },
);
