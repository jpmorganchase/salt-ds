import path from "path";
import { GetServerSidePropsContext } from "next";
import type { ContentProps } from "@jpmorganchase/mosaic-types";
import { MosaicMiddleware } from "@jpmorganchase/mosaic-site-middleware";
import { readdirSync } from "fs";

if (typeof window !== "undefined") {
  throw new Error("This file should not be loaded on the client.");
}

export const withPathResolve: MosaicMiddleware<ContentProps> = async (
  context: GetServerSidePropsContext
) => {
  const snapshotFiles = readdirSync(
    path.join(process.cwd(), process.env.MOSAIC_SNAPSHOT_DIR || "whoops")
  );
  console.log("snapshot files: ", snapshotFiles);

  // const filePath = path.posix.resolve(
  //   process.cwd(),
  //   process.env.MOSAIC_SNAPSHOT_DIR || "whoops",
  //   "salt/index"
  // );
  // console.log(filePath);

  return {};
};
