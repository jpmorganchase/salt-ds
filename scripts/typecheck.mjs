import { runTypeScript } from "./typescript.mjs";

process.exitCode = await runTypeScript(["--noEmit", ...process.argv.slice(2)]);
