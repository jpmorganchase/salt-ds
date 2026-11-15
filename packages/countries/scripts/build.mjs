import { glob } from "glob";
import { buildPackage } from "../../../scripts/buildPackage.mjs";

// These generated modules are also published as default-export deep imports.
// Explicit entries keep require(".../components/US.js") as the component itself.
const components = await glob("src/components/*.tsx", { posix: true });

await buildPackage({
  entries: [
    {
      input: {
        index: "src/index.ts",
        ...Object.fromEntries(
          components.map((file) => [
            file.replace(/^src\//, "").replace(/\.tsx$/, ""),
            file,
          ]),
        ),
      },
    },
  ],
});
