// Test using .js file to do calculations as suggested by
// - https://github.com/amzn/style-dictionary/issues/59
// - https://github.com/amzn/style-dictionary/pull/89
const basisUnit = 4;
const unit = basisUnit * 2;
const base = 28;
const px = (base) => `${base}px`;
module.exports = {
  size: {
    unit: {
      value: px(unit),
    },
    base: {
      value: px(base),
    },
    adornment: {
      value: px(base + unit / 2),
    },
    appheader: {
      value: px(base + unit * 2),
    },
  },
};
