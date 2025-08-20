import type { LayoutProps } from "@jpmorganchase/mosaic-layouts/dist/types";
import { useLayout } from "@jpmorganchase/mosaic-store";
import type React from "react";
import type { FC, ReactNode } from "react";

export type LayoutProviderProps = {
  layoutComponents?: {
    [name: string]: React.FC<LayoutProps> | undefined;
  };
  LayoutProps?: LayoutProps;
  children: ReactNode;
  defaultLayout?: string;
};

export const LayoutProvider: FC<LayoutProviderProps> = ({
  children,
  layoutComponents,
  LayoutProps = {},
  defaultLayout = "FullWidth",
}) => {
  const { layout = defaultLayout } = useLayout();

  const LayoutComponent: FC<LayoutProps> | undefined = layoutComponents?.[
    layout
  ] as FC<LayoutProps>;

  return LayoutComponent ? (
    <LayoutComponent {...LayoutProps}>{children}</LayoutComponent>
  ) : (
    children
  );
};
