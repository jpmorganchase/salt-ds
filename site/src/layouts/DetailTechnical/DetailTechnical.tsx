import { Sidebar } from "@jpmorganchase/mosaic-site-components";
import React, { type FC } from "react";
import { TableOfContents } from "../../components/toc";
import { DetailBase } from "../DetailBase";
import type { LayoutProps } from "../types/index";

export const DetailTechnical: FC<LayoutProps> = ({ children }) => {
  const SecondarySidebar = <TableOfContents />;

  return (
    <DetailBase sidebar={<Sidebar sticky>{SecondarySidebar}</Sidebar>}>
      {children}
    </DetailBase>
  );
};
