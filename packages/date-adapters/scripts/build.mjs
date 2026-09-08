import { buildPackage } from "../../../scripts/buildPackage.mjs";

const entryPoints = {
  types: "src/types/index.ts",
  moment: "src/moment-adapter/index.ts",
  luxon: "src/luxon-adapter/index.ts",
  dayjs: "src/dayjs-adapter/index.ts",
  "date-fns": "src/date-fns-adapter/index.ts",
  "date-fns-tz": "src/date-fns-tz-adapter/index.ts",
};

await buildPackage({
  entries: Object.entries(entryPoints).map(([directory, input]) => ({
    input,
    directory,
    preserveModules: false,
  })),
});
