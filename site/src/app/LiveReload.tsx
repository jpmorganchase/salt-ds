"use client";

import { LiveReload as MosaicLiveReload } from "@jpmorganchase/mosaic-site-middleware/client";
import { mutate } from "swr";
import { SEARCH_RECORDS_URL } from "../components/search/Search";

const refreshSearch = () => {
  // Search records are loaded lazily and cached separately from page content.
  void mutate(SEARCH_RECORDS_URL);
};

export function LiveReload() {
  return <MosaicLiveReload onContentChanged={refreshSearch} />;
}
