export const isTabElement = (el: HTMLElement): boolean =>
  el && el.matches('[class*="uitkTab"]');

export const isEditableElement = (el: HTMLElement): boolean =>
  el && el.matches("[data-editable]");
