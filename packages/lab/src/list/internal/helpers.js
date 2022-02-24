export const isPlainObject = (obj) =>
  Object.prototype.toString.call(obj) === "[object Object]";

export const calcPreferredListHeight = (props = {}) => {
  const {
    borderless,
    displayedItemCount = 0,
    itemCount = 0,
    itemHeight = 0,
    getItemHeight,
  } = props;

  let preferredHeight = borderless ? 0 : 2;

  // if there is no item we render with the preferred count
  const preferredItemCount =
    itemCount === 0
      ? displayedItemCount
      : Math.min(displayedItemCount, itemCount);

  if (typeof getItemHeight === "function") {
    preferredHeight += Array.from({ length: preferredItemCount }).reduce(
      (total, _, index) => total + Number(getItemHeight(index)),
      0
    );
  } else {
    preferredHeight += preferredItemCount * Number(itemHeight);
  }

  // list height will be undefined if the item height can not be
  // converted to a number, for example rem or a percentage string
  return isNaN(preferredHeight) ? undefined : preferredHeight;
};
