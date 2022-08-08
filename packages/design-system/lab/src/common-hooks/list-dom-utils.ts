export const listItemElement = (listEl: HTMLElement, listItemIdx: number) =>
  listEl.querySelector(`:scope > [data-idx="${listItemIdx}"]`);

export function listItemIndex(listItemEl?: HTMLElement) {
  if (listItemEl) {
    let idx: string | null | undefined = listItemEl.dataset.idx;
    if (idx) {
      return parseInt(idx, 10);
      // eslint-disable-next-line no-cond-assign
    } else if ((idx = listItemEl.ariaPosInSet)) {
      return parseInt(idx, 10) - 1;
    }
  }
  return -1;
}

export const listItemId = (el: HTMLElement | null) => el?.id;

export const closestListItem = (el: HTMLElement) =>
  el.closest("[data-idx],[aria-posinset]") as HTMLElement;

export const closestListItemId = (el: HTMLElement) =>
  listItemId(closestListItem(el));

export const closestListItemIndex = (el: HTMLElement) =>
  listItemIndex(closestListItem(el));
