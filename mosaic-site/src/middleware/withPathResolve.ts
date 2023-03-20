import path from "path";
import { GetServerSidePropsContext } from "next";
import type { ContentProps } from "@jpmorganchase/mosaic-types";
import { MosaicMiddleware } from "@jpmorganchase/mosaic-site-middleware";

if (typeof window !== "undefined") {
  throw new Error("This file should not be loaded on the client.");
}

export const withPathResolve: MosaicMiddleware<ContentProps> = async (
  context: GetServerSidePropsContext
) => {
  const dir = path.resolve(
    path.join(process.cwd(), process.env.MOSAIC_SNAPSHOT_DIR || "whoops")
  );

  return {};
};
