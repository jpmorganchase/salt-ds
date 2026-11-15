import {
  resolveContent as resolveMosaicContent,
  resolveMosaicMode,
} from "@jpmorganchase/mosaic-site-middleware";

/** Mosaic shares the resolution between metadata and content in each request. */
export function resolveContent(pathname: string) {
  const { mode, contentUrl } = resolveMosaicMode();
  return resolveMosaicContent(pathname, mode, contentUrl);
}
