import { useRouter } from "next/router";
import { MDXRemote } from "next-mdx-remote";
import { type ReactNode, useEffect } from "react";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";
import styles from "../layouts/Base/Base.module.css";
import { Page404 } from "./404";
import { Page500 } from "./500";

const DefaultFallBackComponent = ({
  error: { message: errorMessage = "unknown" },
}) => {
  const router = useRouter();
  const { resetBoundary } = useErrorBoundary();

  useEffect(() => {
    const handleRouteChange = () => {
      resetBoundary();
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router, resetBoundary]);
  console.error("An un-handled error created a 500 message");
  console.error(errorMessage);
  return <Page500 />;
};

function MDXRemoteWithErrorBoundary({
  components,
  source,
  meta = {},
}: {
  components: any;
  source: { compiledSource: string; frontmatter: Record<string, unknown> };
  meta: Record<string, unknown>;
}) {
  return (
    <ErrorBoundary FallbackComponent={DefaultFallBackComponent}>
      <MDXRemote components={components} lazy {...source} scope={{ meta }} />
    </ErrorBoundary>
  );
}

export function Body({
  components = {},
  type,
  ...props
}: {
  components: any;
  type: string;
  show404?: boolean;
  show500?: boolean;
  content?: ReactNode;
  source: { compiledSource: string; frontmatter: Record<string, unknown> };
}) {
  if (props.show404) {
    return <Page404 />;
  }
  if (props.show500) {
    return <Page500 />;
  }

  if (type === "mdx") {
    return (
      <div className={styles.contentWrapper}>
        <MDXRemoteWithErrorBoundary
          components={components}
          source={props.source}
          meta={props.source.frontmatter}
        />
      </div>
    );
  }
  // If file is JSON, we expect it to have a `content` attr
  if (type === "json") {
    return <div className={styles.contentWrapper}>{props.content}</div>;
  }
  return <div className={styles.contentWrapper}>Unsupported file type</div>;
}
