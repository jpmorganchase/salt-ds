import { Banner, StackLayout } from "@salt-ds/core";
import { ReactElement } from "react";

export const Variant = (): ReactElement => (
  <StackLayout>
    <Banner variant="secondary" status="info" title="Info" />
    <Banner variant="secondary" status="error" title="Error" />
    <Banner variant="secondary" status="warning" title="Warning" />
    <Banner variant="secondary" status="success" title="Success" />
  </StackLayout>
);
