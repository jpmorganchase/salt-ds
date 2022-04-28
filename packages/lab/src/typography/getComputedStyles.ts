export function getComputedStyles(el: HTMLElement) {
  const { lineHeight, height, width } = window.getComputedStyle(el);

  return {
    lineHeight: parseFloat(lineHeight.replace("px", "")),
    height: parseFloat(height.replace("px", "")),
    width: parseFloat(width.replace("px", "")),
  };
}
