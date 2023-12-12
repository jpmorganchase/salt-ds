import { withBaseName } from "./utils";
import { PageRange, usePagination } from "./usePagination";
import { ReactElement } from "react";
import { PageButton } from "./PageButton";
import { usePaginationContext } from "./usePaginationContext";

export interface RegularControlsProps {
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

export function RegularControls({
  siblingPairCount = 2,
  boundaryCount = 1,
}: RegularControlsProps) {
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
