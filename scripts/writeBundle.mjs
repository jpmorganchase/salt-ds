import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeBundle(outputDirectory, output) {
  const directory = path.resolve(outputDirectory);
  const files = output.map((item) => {
    const filename = path.resolve(directory, item.fileName);
    const relative = path.relative(directory, filename);
    if (
      !relative ||
      relative === ".." ||
      relative.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relative)
    ) {
      throw new Error(
        `Bundle output must stay inside its directory: ${item.fileName}`,
      );
    }
    return { filename, item };
  });

  // Create each directory once instead of repeating recursive mkdir per asset.
  const directories = [
    ...new Set(files.map(({ filename }) => path.dirname(filename))),
  ];
  const directoryResults = await Promise.allSettled(
    directories.map((directory) => mkdir(directory, { recursive: true })),
  );
  const directoryFailure = directoryResults.find(
    (result) => result.status === "rejected",
  );
  if (directoryFailure) throw directoryFailure.reason;

  let cursor = 0;
  let failure;
  // Bound open files, and finish all in-flight writes before reporting failure.
  await Promise.all(
    Array.from({ length: Math.min(16, files.length) }, async () => {
      while (!failure && cursor < files.length) {
        const { filename, item } = files[cursor++];
        try {
          await writeFile(
            filename,
            item.type === "chunk" ? item.code : item.source,
          );
        } catch (error) {
          failure ??= error;
        }
      }
    }),
  );
  if (failure) throw failure;
}
