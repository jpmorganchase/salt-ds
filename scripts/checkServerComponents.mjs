import {
  exec as execCallback,
  execFile as execFileCallback,
} from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

// Builds a Next.js App Router app (test/server-components) whose pages are
// React Server Components that import Salt, with both Turbopack and webpack.
// The app uses the packed packages, as they're published, to check the
// "use client" directives added by the build. Run `yarn build` first.

const exec = promisify(execCallback);
const execFile = promisify(execFileCallback);
const require = createRequire(import.meta.url);
const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const appDir = path.join(rootDir, "test", "server-components");
const appModulesDir = path.join(appDir, "node_modules");
const distDir = path.join(appDir, ".next");
// Next.js is installed for the docs site.
const nextBin = require.resolve("next/dist/bin/next");

const packages = [
  "core",
  "countries",
  "date-adapters",
  "date-components",
  "embla-carousel",
  "icons",
  "lab",
  "styles",
  "window",
];

// Markup that shows each prerendered page rendered its Salt components.
const expectedMarkup = {
  "index.html": ["saltButton", "saltIcon", "serverComponent-text"],
  "carousel.html": ["saltCarouselCard"],
  "countries.html": ["saltCountrySymbol"],
  "dates.html": ["saltCalendar"],
  "lab.html": ["saltContentStatus"],
};

const unbuilt = packages.filter(
  (name) => !existsSync(path.join(rootDir, "packages", name, "dist-es")),
);
if (unbuilt.length > 0) {
  console.error(
    `Missing builds for ${unbuilt.join(", ")}. Run \`yarn build\` first.`,
  );
  process.exit(1);
}

// The packed packages are installed in the app, so they're used instead of the
// workspace packages. Their dependencies are resolved from the repo.
await rm(appModulesDir, { recursive: true, force: true });

let failed = false;

try {
  const archiveDir = await mkdtemp(
    path.join(tmpdir(), "salt-server-components-"),
  );

  try {
    for (const name of packages) {
      const archive = path.join(archiveDir, `${name}.tgz`);
      const destination = path.join(appModulesDir, "@salt-ds", name);

      // Runs in a shell, as Windows can't run `yarn.cmd` without one.
      await exec(`yarn workspace @salt-ds/${name} pack --out "${archive}"`, {
        cwd: rootDir,
      });
      await mkdir(destination, { recursive: true });
      await execFile("tar", [
        "-xzf",
        archive,
        "-C",
        destination,
        "--strip-components=1",
      ]);
    }
  } finally {
    await rm(archiveDir, { recursive: true, force: true });
  }

  for (const bundler of ["turbopack", "webpack"]) {
    await rm(distDir, { recursive: true, force: true });

    try {
      await execFile(
        process.execPath,
        [
          nextBin,
          "build",
          appDir,
          ...(bundler === "webpack" ? ["--webpack"] : []),
        ],
        {
          cwd: rootDir,
          env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
          maxBuffer: 20 * 1024 * 1024,
        },
      );
    } catch (error) {
      failed = true;
      console.error(
        `Build with ${bundler} failed:\n${error.stdout ?? ""}${error.stderr ?? ""}`,
      );
      continue;
    }

    const missing = [];
    for (const [page, markers] of Object.entries(expectedMarkup)) {
      const html = await readFile(
        path.join(distDir, "server", "app", page),
        "utf8",
      ).catch(() => "");

      for (const marker of markers) {
        if (!html.includes(marker)) {
          missing.push(`${page}: ${marker}`);
        }
      }
    }

    if (missing.length > 0) {
      failed = true;
      console.error(
        `Build with ${bundler} didn't render:\n${missing.join("\n")}`,
      );
    } else {
      console.log(`Built with ${bundler}: all pages rendered`);
    }
  }
} finally {
  // The packed packages are only needed for this check.
  await rm(appModulesDir, { recursive: true, force: true });
}

process.exitCode = failed ? 1 : 0;
