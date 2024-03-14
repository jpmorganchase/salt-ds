function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return {
    r,
    g,
    b,
  };
}

module.exports = function colorFormatSwap(swapTo, color) {
  if (swapTo === "hex") {
    if (color.includes("rgba")) {
      let [r, g, b, a] = color
        .replace("rgba(", "")
        .replace(")", "")
        .split(",")
        .map((x) => parseInt(x.trim()));
      a = ((a * 255) | (1 << 8)).toString(16).slice(1).trim();
      return rgbToHex(r, g, b) + a;
    } else {
      const [r, g, b] = color
        .replace("rgb(", "")
        .replace(")", "")
        .split(",")
        .map((x) => parseInt(x.trim()));
      return rgbToHex(r, g, b);
    }
  } else {
    return hexToRGB(color);
  }
};
