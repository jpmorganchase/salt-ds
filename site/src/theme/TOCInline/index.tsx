import React from "react";
import { makePrefixer, ToolkitProvider } from "@jpmorganchase/uitk-core";
import TOCItems from "@theme-original/TOCItems";

const withBaseName = makePrefixer("uitkTocInline");

import "./TOCInline.css";

export default function TOCInline(props) {
  const { toc, minHeadingLevel, maxHeadingLevel, ...restProps } = props;
  return (
    <ToolkitProvider density="medium">
        <div className="docs-toc-container">
            <TOCItems
                toc={toc}
                minHeadingLevel={minHeadingLevel}
                maxHeadingLevel={maxHeadingLevel}
                className="table-of-contents"
                linkClassName={withBaseName("link")}
                linkActiveClassName={withBaseName("activeLink")}
            />
        </div>
    </ToolkitProvider>
  );
}
