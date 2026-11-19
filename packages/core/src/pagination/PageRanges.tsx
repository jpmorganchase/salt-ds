import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { type ReactElement, useCallback } from "react";
import { makePrefixer } from "../utils";
import { PageButton } from "./PageButton";
import pageRangesCss from "./PageRanges.css";
import { type PageRange, usePagination } from "./usePagination";
import { usePaginationContext } from "./usePaginationContext";

const withBaseName = makePrefixer("saltPageRanges");

export interface PageRangesProps {
  /**
   * Number of pages shown at the start and end of the page range when it's truncated. Values below `1` are treated as `1`.
   * @default 1
   */
  boundaryCount?: number;
  /**
   * Number of pages shown on each side of the current page when the page range is truncated.
   * @default 2
   */
  siblingCount?: number;
}

const Ellipsis = () => {
  return <div className={withBaseName("ellipsis")}>{"\u2026"}</div>;
};

const mapRange = (range: PageRange, fn: (i: number) => ReactElement) => {
  const result: ReactElement[] = [];
  for (let i = range[0]; i <= range[1]; ++i) {
    result.push(fn(i));
  }
  return result;
};

export function PageRanges({
  siblingCount = 2,
  boundaryCount = 1,
}: PageRangesProps) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-page-ranges",
    css: pageRangesCss,
    window: targetWindow,
  });

  const { count, page } = usePaginationContext();

  const renderPages = useCallback(
    (range: PageRange) =>
      mapRange(range, (i) => (
        <PageButton key={i} page={i} selected={page === i} />
      )),
    [page],
  );

  const [leftPages, middlePages, rightPages] = usePagination(
    page,
    count,
    Math.max(1, boundaryCount),
    siblingCount,
  );

  return (
    <>
      {leftPages && (
        <>
          {renderPages(leftPages)}
          <Ellipsis />
        </>
      )}
      {middlePages && renderPages(middlePages)}
      {rightPages && (
        <>
          <Ellipsis />
          {renderPages(rightPages)}
        </>
      )}
    </>
  );
}
