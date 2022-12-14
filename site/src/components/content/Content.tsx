import { PropsWithChildren } from "react";
import clsx from "clsx";
import type { TOCItem } from "@docusaurus/mdx-loader";
import { ToolkitProvider } from "@salt-ds/core";
import TOCInline from "@site/src/theme/TOCInline";

const Content = ({
  children,
  toc,
}: PropsWithChildren & { toc?: TOCItem[] }): JSX.Element => {
  return (
    <ToolkitProvider mode="light">
      <div className="docs-page-container">
        <div className={clsx("docs-page-content", { withToc: toc })}>
          {children}
        </div>
        {toc && <TOCInline toc={toc} />}
      </div>
    </ToolkitProvider>
  );
};

export default Content;
