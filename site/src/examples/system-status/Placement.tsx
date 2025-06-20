import {
  Banner,
  BannerActions,
  BannerContent,
  Button,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";

import type { ReactElement } from "react";

export const Placement = (): ReactElement => {
  return (
    <StackLayout
      style={{
        width: "100%",
        background: "var( --salt-container-primary-background)",
      }}
    >
      <SystemStatus>
        <SystemStatusContent>
          <Text color="inherit">New feature updates are available.</Text>
        </SystemStatusContent>
      </SystemStatus>
      <StackLayout
        gap={4.5}
        style={{
          padding:
            "var(--salt-spacing-100) var(--salt-spacing-300) calc(var(--salt-spacing-100)*4.5) ",
        }}
      >
        <Text styleAs="display2"> Payment Activity</Text>
        <Banner status="warning" variant="secondary">
          <BannerContent role="status">
            You have outstanding checks more than 30 days old. Review to prevent
            fraud.
          </BannerContent>
          <BannerActions>
            <Button aria-label="refresh" appearance="transparent">
              <CloseIcon />
            </Button>
          </BannerActions>
        </Banner>
      </StackLayout>
    </StackLayout>
  );
};
