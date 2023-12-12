import { ReactElement } from "react";
import { makePrefixer } from "@salt-ds/core";
import { PageButton } from "./PageButton";
import { PageRange, usePagination } from "./usePagination";
import { usePaginationContext } from "./usePaginationContext";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import pageRangesCss from "./PageRanges.css";

const withBaseName = makePrefixer("saltPageRanges");

export interface PageRangesProps {
  boundaryCount?: number;
  siblingPairCount?: number;
}

const Ellipsis = () => {
  return <div className={withBaseName("ellipsis")}>{`\u2026`}</div>;
};

const mapRange = (range: PageRange, fn: (i: number) => ReactElement) => {
  const result: ReactElement[] = [];
  for (let i = range[0]; i <= range[1]; ++i) {
    result.push(fn(i));
  }
  return result;
};

export function PageRanges({
  siblingPairCount = 2,
  boundaryCount = 1,
}: PageRangesProps) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-pageRanges",
    css: pageRangesCss,
    window: targetWindow,
  });

  const { count, page } = usePaginationContext();

  const renderPages = (range?: PageRange, selectedPage?: number) => {
    if (!range) {
      return null;
    }
    return mapRange(range, (i) => (
      <PageButton key={i} page={i} isSelected={selectedPage === i} />
    ));
  };

  const [leftPages, middlePages, rightPages] = usePagination(
    page,
    count,
    Math.max(1, boundaryCount),
    siblingPairCount
  );

  return (
    <>
      {renderPages(leftPages, page)}
      {leftPages && <Ellipsis />}
      {renderPages(middlePages, page)}
      {rightPages && <Ellipsis />}
      {renderPages(rightPages, page)}
    </>
  );
}
