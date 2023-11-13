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
  count: number;
  page?: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  compact?: boolean;
  withInput?: boolean;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      className,
      count,
      children,
      initialPage = 1,
      page: pageProp,
      onPageChange: onPageChangeProp,
      compact = false,
      withInput = true,
      ...restProps
    },
    ref
  ) {
    const [pageState, setPageState] = useControlled({
      controlled: pageProp,
      default: initialPage,
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
        compact,
        withInput,
        onPageChange,
        paginatorElement,
        setPaginatorElement,
      }),
      [pageState, compact, count, onPageChange, paginatorElement, withInput]
    );

    const onKeyDown: KeyboardEventHandler = useCallback(
      ({ altKey, key }) => {
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
      },
      [count, onPageChange, pageState]
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
