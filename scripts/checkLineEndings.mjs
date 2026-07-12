import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export function findInvalidIndexLineEndings(output) {
  return output
    .split("\0")
    .filter(Boolean)
    .flatMap((record) => {
      const match = /^(i\/[^\s]+)\s+w\/[^\s]+\s+attr\/[^\t]+\t(.+)$/u.exec(
        record,
      );
      if (!match || (match[1] !== "i/crlf" && match[1] !== "i/mixed")) {
        return [];
      }
      return [{ lineEnding: match[1], path: match[2] }];
    });
}

export function checkIndexLineEndings() {
  const result = spawnSync("git", ["ls-files", "--eol", "-z"], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git exited with ${result.status}`);
  }

  const invalid = findInvalidIndexLineEndings(result.stdout);
  if (invalid.length > 0) {
    for (const file of invalid) {
      console.error(`${file.lineEnding}: ${file.path}`);
    }
    throw new Error(`${invalid.length} indexed file(s) are not LF-normalized`);
  }

  console.log("Indexed text files are LF-normalized.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    checkIndexLineEndings();
  } catch (error) {
    console.error(`Line-ending check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
