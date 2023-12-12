import { useAriaAnnouncer, useControlled } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  forwardRef,
  HTMLAttributes,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PaginationContext, paginationContext } from "./PaginationContext";
import { withBaseName } from "./utils";

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
  onPageChange?: (page: number) => void;
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
    const [pageState, setPageState] = useControlled({
      controlled: pageProp,
      default: defaultPage,
      name: "Paginator",
      state: "page",
    });

    const [paginatorElement, setPaginatorElement] = useState<HTMLDivElement>();

    const onPageChange = useCallback(
      (page: number) => {
        setPageState(page);
        onPageChangeProp && onPageChangeProp(page);
      },
      [onPageChangeProp, setPageState]
    );

    const contextValue: PaginationContext = useMemo(
      () => ({
        page: pageState,
        count,
        onPageChange,
        paginatorElement,
        setPaginatorElement,
      }),
      [pageState, count, onPageChange, paginatorElement]
    );

    const onKeyDown: KeyboardEventHandler = ({ altKey, key }) => {
      if (altKey) {
        switch (key) {
          case "PageDown":
            onPageChange(Math.min(pageState + 1, count));
            break;
          case "PageUp":
            onPageChange(Math.max(pageState - 1, 1));
            break;
          default:
        }
      }
    };

    const { announce } = useAriaAnnouncer();
    const mounted = useRef<boolean>(false);

    useEffect(() => {
      if (mounted.current) {
        announce(`Page ${pageState}`);
      } else {
        mounted.current = true;
      }
    }, [announce, pageState]);

    useEffect(() => {
      if (count < pageState) {
        onPageChange(1);
      }
    }, [count, pageState, onPageChange]);

    if (count < 2) {
      return null;
    }

    return (
      <Provider value={contextValue}>
        <nav
          className={clsx(withBaseName(), className)}
          onKeyDown={onKeyDown}
          ref={ref}
          {...restProps}
        >
          {children}
        </nav>
      </Provider>
    );
  }
);
