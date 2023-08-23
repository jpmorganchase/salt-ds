import { ReactElement } from "react";
import {
  Banner,
  BannerActions,
  BannerContent,
  Button,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { RefreshIcon } from "@salt-ds/icons";

export const Warning = (): ReactElement => (
  <StackLayout gap={3} style={{ width: "80%" }}>
    <Banner status="warning">
      <BannerContent role="status">
        System is under increased load
      </BannerContent>
      <BannerActions>
        <Button aria-label="refresh" variant="secondary">
          <RefreshIcon />
        </Button>
      </BannerActions>
    </Banner>
    <Text styleAs="h1">Title</Text>
    <Text>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
    </Text>
  </StackLayout>
);
