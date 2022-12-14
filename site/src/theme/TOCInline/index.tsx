import React from "react";
import { makePrefixer, SaltProvider } from "@salt-ds/core";
import TOCItems from "@theme-original/TOCItems";

const withBaseName = makePrefixer("uitkTocInline");

import "./TOCInline.css";

export default function TOCInline(props) {
  const { toc, minHeadingLevel, maxHeadingLevel, ...restProps } = props;
  return (
    <div className="docs-toc-container">
      <div className="docs-toc-intro">On this page</div>
      <SaltProvider density="medium">
        <TOCItems
          toc={toc}
          minHeadingLevel={minHeadingLevel}
          maxHeadingLevel={maxHeadingLevel}
          className="table-of-contents"
          linkClassName={withBaseName("link")}
          linkActiveClassName={withBaseName("activeLink")}
        />
      </SaltProvider>
    </div>
  );
}
