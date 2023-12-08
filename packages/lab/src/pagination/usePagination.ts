export type PageRange = [number, number];

export function usePagination(
  page: number,
  count: number,
  boundaryCount: number,
  siblingPairCount: number
) {
  const totalButtonsVisible = 2 * (boundaryCount + siblingPairCount) + 3;
  const isEnoughSpace = totalButtonsVisible >= count;

  const isLeftEllipsis =
    !isEnoughSpace && page - boundaryCount - siblingPairCount > 2;

  const isRightEllipsis =
    !isEnoughSpace && page + boundaryCount + siblingPairCount + 1 < count;

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
      isRightEllipsis ? boundaryCount + 2 + 2 * siblingPairCount : count,
    ];
  } else if (!isRightEllipsis) {
    middlePages = [count - boundaryCount - 1 - 2 * siblingPairCount, count];
  } else {
    middlePages = [page - siblingPairCount, page + siblingPairCount];
  }

  return [leftPages, middlePages, rightPages] as const;
}
