import { compute } from "compute-scroll-into-view";

export function scrollIntoView(item, list) {
  if (!item) {
    return;
  }

  const actions = compute(item, {
    boundary: list,
    block: "nearest",
    scrollMode: "if-needed",
  });

  for (const { el, top, left } of actions) {
    el.scrollTop = top;
    el.scrollLeft = left;
  }
}
