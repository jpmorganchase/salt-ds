const { transform } = require("@swc/core");
const path = require("path");

const swc = () => ({
  name: "swc",
  async transform(code, filename) {
    const ext = path.extname(filename);
    const options = {
      filename,
      sourceMaps: true,
      jsc: {
        target: "es2022",
        parser: {
          syntax: "typescript",
          tsx: true,
        },
        transform: {
          react: {
            runtime: "automatic",
          },
        },
      },
    };

    if ([".jsx", ".tsx", ".js", ".ts"].includes(ext)) {
      return transform(code, options);
    }
    return { code, map: null };
  },
});

module.exports = { swc };
