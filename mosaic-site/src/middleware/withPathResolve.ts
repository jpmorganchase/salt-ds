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
  const { resolvedUrl } = context;
  console.log(resolvedUrl);
  path.posix.resolve(process.cwd(), "public/snapshots/latest/salt/index.mdx");

  return {};
};
