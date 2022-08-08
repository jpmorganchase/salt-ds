import { useAriaAnnouncer, useControlled } from "@jpmorganchase/uitk-core";
import cn from "classnames";
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
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      className,
      count,
      children,
      initialPage = 1,
      page: pageProp,
      onPageChange: onPageChangeProp,
      compact = false,
      ...restProps
    },
    ref
  ) => {
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
        onPageChange,
        paginatorElement,
        setPaginatorElement,
      }),
      [pageState, count, onPageChange]
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
      [onPageChange]
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
          className={cn(withBaseName(), className)}
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
