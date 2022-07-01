export function getComputedStyles(el: HTMLElement) {
  const {
    lineHeight,
    height,
    width,
    fontSize: rawFontSize,
  } = window.getComputedStyle(el);

  const fontSize = parseFloat(rawFontSize.replace("px", ""));
  return {
    lineHeight:
      lineHeight === "normal"
        ? fontSize
        : parseFloat(lineHeight.replace("px", "")),
    height: parseFloat(height.replace("px", "")),
    width: parseFloat(width.replace("px", "")),
  };
}
