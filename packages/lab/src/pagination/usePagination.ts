export type PageRange = [number, number];

export function usePagination(
  page: number,
  count: number,
  boundaryCount: number,
  siblingCount: number
) {
  const totalButtonsVisible = 2 * (boundaryCount + siblingCount) + 3;
  const isEnoughSpace = totalButtonsVisible >= count;

  const isLeftEllipsis =
    !isEnoughSpace && page - boundaryCount - siblingCount > 2;

  const isRightEllipsis =
    !isEnoughSpace && page + boundaryCount + siblingCount + 1 < count;

  const leftPages = isLeftEllipsis
    ? ([1, boundaryCount] as PageRange)
    : undefined;

  const rightPages = isRightEllipsis
    ? ([count - boundaryCount + 1, count] as PageRange)
    : undefined;

  let middlePages: PageRange;

  if (!isLeftEllipsis) {
    middlePages = [
      1,
      isRightEllipsis ? boundaryCount + 2 + 2 * siblingCount : count,
    ];
  } else if (!isRightEllipsis) {
    middlePages = [count - boundaryCount - 1 - 2 * siblingCount, count];
  } else {
    middlePages = [page - siblingCount, page + siblingCount];
  }

  return [leftPages, middlePages, rightPages] as const;
}
