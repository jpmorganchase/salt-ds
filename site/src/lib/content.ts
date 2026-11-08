import {
  resolveContent as resolveMosaicContent,
  resolveMosaicMode,
} from "@jpmorganchase/mosaic-site-middleware";
import { cache } from "react";

/** Metadata and content share the same request-cached resolution. */
export const resolveContent = cache(async (pathname: string) => {
  const { mode, contentUrl } = resolveMosaicMode();
  return resolveMosaicContent(pathname, mode, contentUrl);
});
