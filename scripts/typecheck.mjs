import { runTypeScript } from "./typescript.mjs";

await runTypeScript(["--noEmit", ...process.argv.slice(2)]);
