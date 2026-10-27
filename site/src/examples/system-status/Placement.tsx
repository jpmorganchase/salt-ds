import {
  Banner,
  BannerContent,
  H1,
  OnSolidButton,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import {
  SystemStatus,
  SystemStatusActions,
  SystemStatusContent,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Placement = (): ReactElement => (
  <StackLayout gap={0} style={{ width: "100%" }}>
    <SystemStatus>
      <SystemStatusContent>
        <Text color="inherit">New feature updates are available.</Text>
      </SystemStatusContent>
      <SystemStatusActions>
        <OnSolidButton aria-label="Dismiss">
          <CloseIcon aria-hidden />
        </OnSolidButton>
      </SystemStatusActions>
    </SystemStatus>
    <StackLayout
      gap={3}
      style={{
        padding: "var(--salt-spacing-300) var(--salt-layout-page-margin)",
      }}
    >
      <H1 styleAs="display2">Payment activity</H1>
      <Banner status="warning" variant="secondary">
        <BannerContent>
          You have outstanding checks more than 30 days old. Review to prevent
          fraud.
        </BannerContent>
      </Banner>
    </StackLayout>
  </StackLayout>
);
