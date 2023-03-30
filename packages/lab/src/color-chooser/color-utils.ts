export const isTransparent = (color?: string): boolean => {
  return color ? /#[\da-f]{6}00/i.test(color) : false;
};
