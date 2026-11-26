"use client";

import { useRoute } from "@jpmorganchase/mosaic-store";
import { MDXClient } from "next-mdx-remote-client";
import type { SerializeResult } from "next-mdx-remote-client/serialize";
import { ErrorBoundary } from "react-error-boundary";
import styles from "../layouts/Base/Base.module.css";
import { Page500 } from "./500";
import { mdxComponents } from "./mdxComponents";

/** Keep Salt's MDX registry in the client graph and compilation on the server. */
export function Body({ source }: { source: SerializeResult }) {
  const { route } = useRoute();
  if ("error" in source) throw source.error;

  return (
    <div className={styles.contentWrapper}>
      <ErrorBoundary
        fallbackRender={({ resetErrorBoundary }) => (
          <Page500 retry={resetErrorBoundary} />
        )}
        onError={console.error}
        resetKeys={[route]}
      >
        <MDXClient {...source} components={mdxComponents} />
      </ErrorBoundary>
    </div>
  );
}
