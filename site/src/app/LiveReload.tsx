"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { mutate } from "swr";
import { SEARCH_RECORDS_URL } from "../components/search/Search";

/** Refresh server-rendered MDX when the local Mosaic source changes. */
export function LiveReload() {
  const router = useRouter();

  useEffect(() => {
    const source = new EventSource("/api/content/live");
    const refresh = () => {
      router.refresh();
      // Search loads its records lazily; refresh that client cache too.
      void mutate(SEARCH_RECORDS_URL);
    };
    source.addEventListener("content-changed", refresh);
    return () => {
      source.removeEventListener("content-changed", refresh);
      source.close();
    };
  }, [router]);

  return null;
}
