// Test using .js file to do calculations as suggested by
// - https://github.com/amzn/style-dictionary/issues/59
// - https://github.com/amzn/style-dictionary/pull/89
const px = (base) => `${base}px`;
module.exports = {
  size: {
    basis: {
      unit: {
        value: px(4),
      },
    },
    graphic: {
      small: {
        value: px(12),
      },
      medium: {
        value: px(24),
      },
      large: {
        value: px(48),
      },
    },
    sharktooth: {
      height: {
        value: px(5),
      },
      width: {
        value: px(10),
      },
    },
  },
};
