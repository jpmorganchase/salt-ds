import React, { FC } from "react";
import { Sidebar } from "@jpmorganchase/mosaic-site-components";
import { DetailBase } from "../DetailBase";
import { LayoutProps } from "../types/index";
import { TableOfContents } from "../../components/toc";

export const DetailTechnical: FC<LayoutProps> = ({ children }) => {
  const SecondarySidebar = <TableOfContents />;

  return (
    <DetailBase sidebar={<Sidebar sticky>{SecondarySidebar}</Sidebar>}>
      {children}
    </DetailBase>
  );
};
