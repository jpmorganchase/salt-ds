import computeScrollIntoView from "compute-scroll-into-view";

export function scrollIntoView(item, list) {
  if (!item) {
    return;
  }

  const actions = computeScrollIntoView(item, {
    boundary: list,
    block: "nearest",
    scrollMode: "if-needed",
  });

  actions.forEach(({ el, top, left }) => {
    el.scrollTop = top;
    el.scrollLeft = left;
  });
}
