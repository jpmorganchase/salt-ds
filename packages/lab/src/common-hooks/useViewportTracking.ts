import {
  MutableRefObject,
  RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import { CollectionItem } from "./collectionTypes";
import { useResizeObserver } from "../responsive/useResizeObserver";

const HeightOnly = ["height"];
const HeightWithScroll = ["height", "scrollHeight"];
const EMPTY_ARRAY: any[] = [];

const ObservedDimensions = {
  containerOnly: [HeightWithScroll, EMPTY_ARRAY],
  withContent: [HeightOnly, HeightOnly],
};
const getObservedDimensions = (containerOnly: boolean) =>
  containerOnly
    ? ObservedDimensions.containerOnly
    : ObservedDimensions.withContent;

const NULL_REF = { current: null };

const getItemTop = (
  element: HTMLElement,
  offsetContainer: HTMLElement | null
) => {
  const { transform = "none" } = getComputedStyle(element);
  if (transform.startsWith("matrix")) {
    const pos = transform.lastIndexOf(",");
    return parseInt(transform.slice(pos + 1));
  } else {
    let offsetParent = element.offsetParent as HTMLElement;
    if (offsetParent === offsetContainer || offsetContainer === null) {
      return element.offsetTop;
    } else {
      let top = element.offsetTop;
      while (offsetParent !== null && offsetParent !== offsetContainer) {
        top += offsetParent.offsetTop;
        offsetParent = offsetParent.offsetParent as HTMLElement;
      }
      return top;
    }
  }
};

export interface ViewportTrackingProps<Item> {
  containerRef: RefObject<HTMLElement>;
  contentRef?: RefObject<HTMLElement>;
  highlightedIdx?: number;
  indexPositions: CollectionItem<Item>[];
  stickyHeaders?: boolean;
}

export interface ViewportTrackingResult<Item> {
  isScrolling: MutableRefObject<boolean>;
  scrollIntoView: (item: CollectionItem<Item>) => void;
}

export const useViewportTracking = <Item>({
  containerRef,
  contentRef = NULL_REF,
  highlightedIdx = -1,
  indexPositions,
  stickyHeaders = false,
}: ViewportTrackingProps<Item>): ViewportTrackingResult<Item> => {
  const scrolling = useRef<boolean>(false);
  const viewport = useRef({
    height: 0,
    contentHeight: 0,
  });

  const scrollTo = useCallback((scrollPos: number) => {
    scrolling.current = true;
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollPos;
    }
    setTimeout(() => {
      scrolling.current = false;
    });
  }, []);

  const scrollToStart = useCallback(() => scrollTo(0), [scrollTo]);

  const scrollToEnd = useCallback(() => {
    scrollTo(viewport.current.contentHeight - viewport.current.height);
  }, [scrollTo]);

  const scrollIntoViewIfNeeded = useCallback(
    (item: CollectionItem<Item>) => {
      const offsetContainer = contentRef.current || containerRef.current;
      if (item.id) {
        const el = document.getElementById(item.id);
        if (el && containerRef.current) {
          const { height: viewportHeight } = viewport.current;
          const targetEl =
            el.ariaExpanded && el.firstChild
              ? (el.firstChild as HTMLElement)
              : el;
          const headerHeight = stickyHeaders ? 36 : 0;
          const itemTop = getItemTop(targetEl, offsetContainer);
          const itemHeight = targetEl.offsetHeight;
          const { scrollTop } = containerRef.current;
          const viewportStart = scrollTop + headerHeight;
          const viewportEnd = viewportStart + viewportHeight - headerHeight;

          if (itemTop + itemHeight > viewportEnd || itemTop < viewportStart) {
            const newScrollTop =
              itemTop + itemHeight > viewportEnd
                ? scrollTop + (itemTop + itemHeight) - viewportEnd
                : itemTop - headerHeight;

            scrollTo(newScrollTop);
          }
        }
      }
    },
    [containerRef, contentRef, scrollTo, stickyHeaders]
  );

  useLayoutEffect(() => {
    const { height, contentHeight } = viewport.current;
    const item = indexPositions[highlightedIdx];
    if (contentHeight > height && item) {
      const [firstItem] = indexPositions;
      const [lastItem] = indexPositions.slice(-1);
      if (item === firstItem) {
        scrollToStart();
      } else if (item === lastItem) {
        scrollToEnd();
      } else {
        scrollIntoViewIfNeeded(indexPositions[highlightedIdx]);
      }
    }
  }, [
    highlightedIdx,
    indexPositions,
    scrollIntoViewIfNeeded,
    scrollToEnd,
    scrollToStart,
  ]);

  const onContainerResize = useCallback(({ height, scrollHeight }) => {
    if (typeof height === "number") {
      viewport.current.height = height;
    }
    if (typeof scrollHeight === "number") {
      viewport.current.contentHeight = scrollHeight;
    }
  }, []);

  const onContentResize = useCallback(({ height }) => {
    if (typeof height === "number") {
      viewport.current.contentHeight = height;
    }
  }, []);

  // If we only have a container, then we will observe its height and scrollHeight,
  // contentRef will be null, so second call to observer will observe nothing.
  // If we have both container and content, then we observe the height of each.
  const [containerDimensions, contentDimensions] = getObservedDimensions(
    contentRef === NULL_REF
  );
  useResizeObserver(containerRef, containerDimensions, onContainerResize, true);
  useResizeObserver(contentRef, contentDimensions, onContentResize, true);

  return {
    isScrolling: scrolling,
    scrollIntoView: scrollIntoViewIfNeeded,
  };
};
