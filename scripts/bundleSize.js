const {
  getPackageStats,
  getPackageExportSizes,
} = require("package-build-stats");
const path = require("path");
const { readFile } = require("fs").promises;

const packagePath =
  path.resolve(process.cwd(), process.argv[2]) || process.cwd();

(async () => {
  const output = {};

  const stats = await getPackageStats(packagePath, {
    client: "yarn",
  });

  const packageJsonRaw = await readFile(
    path.join(packagePath, "package.json"),
    "utf-8"
  );
  const packageJson = JSON.parse(packageJsonRaw);

  output[packageJson.name] = { minified: stats.size, gzip: stats.gzip };

  const exportSizes = await getPackageExportSizes(packagePath, {
    client: "yarn",
    isLocal: true,
  });

  exportSizes.assets.forEach((asset) => {
    output[asset.name] = { minified: asset.size, gzip: asset.gzip };
  });

  console.log(output);
})();
