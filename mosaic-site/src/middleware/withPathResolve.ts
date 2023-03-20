import path from "path";
import { GetServerSidePropsContext } from "next";
import type { ContentProps } from "@jpmorganchase/mosaic-types";
import { MosaicMiddleware } from "@jpmorganchase/mosaic-site-middleware";
import { readFileSync } from "fs";

if (typeof window !== "undefined") {
  throw new Error("This file should not be loaded on the client.");
}

export const withPathResolve: MosaicMiddleware<ContentProps> = async (
  context: GetServerSidePropsContext
) => {
  const filePath = path.posix.join(
    process.cwd(),
    process.env.MOSAIC_SNAPSHOT_DIR || "whoops",
    "salt/index"
  );
  console.log(filePath);
  const data = readFileSync(filePath, "utf8");
  console.log(data);

  return {};
};
