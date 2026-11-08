"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { mutate } from "swr";

/** Refresh server-rendered MDX when the local Mosaic source changes. */
export function LiveReload() {
  const router = useRouter();

  useEffect(() => {
    const source = new EventSource("/api/content/live");
    const refresh = () => {
      router.refresh();
      // Salt loads the full text index lazily; refresh that client cache too.
      void mutate("/search-data.json");
    };
    source.addEventListener("content-changed", refresh);
    return () => {
      source.removeEventListener("content-changed", refresh);
      source.close();
    };
  }, [router]);

  return null;
}
