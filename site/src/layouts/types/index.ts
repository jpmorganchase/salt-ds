import { ReactNode, ReactElement } from "react";
import type {
  Breadcrumb,
  LinkType,
} from "@jpmorganchase/mosaic-site-components";
import { FooterProps } from "@jpmorganchase/mosaic-site-components";

export type LayoutProps = {
  children?: ReactNode;
  sidebar?: ReactElement;
  pageTitle?: ReactElement;
  className?: string;
  ToCProps?: {
    items: any;
  };
  SidebarProps?: {
    helpLinks: Pick<FooterProps, "helpLinks">;
  };
  NextPrevLinksProps?: {
    next?: LinkType;
    prev?: LinkType;
  };
  BreadcrumbsProps?: { breadcrumbs: typeof Breadcrumb[] };
  BackLinkProps?: { label?: string; link: string };
  Footer?: ReactElement;
  FooterProps?: any;
  layout?: string;
  meta?: {
    data: { [key: string]: any };
  };
  frontmatter?: {
    [key: string]: any;
  };
};
