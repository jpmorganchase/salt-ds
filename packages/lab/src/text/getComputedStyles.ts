export function getComputedStyles(el: HTMLElement) {
  const { lineHeight, height, width, paddingTop, paddingBottom } =
    window.getComputedStyle(el);

  return {
    lineHeight: parseFloat(lineHeight.replace("px", "")),
    height: parseFloat(height.replace("px", "")),
    width: parseFloat(width.replace("px", "")),
    paddingTop: parseFloat(paddingTop.replace("px", "")),
    paddingBottom: parseFloat(paddingBottom.replace("px", "")),
  };
}
