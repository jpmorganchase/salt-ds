import {
  Banner,
  BannerActions,
  BannerContent,
  Button,
  Link,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Info = (): ReactElement => (
  <StackLayout gap={3} style={{ width: "80%" }}>
    <Banner>
      <BannerContent>
        There has been an update to the{" "}
        <Link href="#">Terms and Conditions</Link>.
      </BannerContent>
      <BannerActions>
        <Button aria-label="close" variant="secondary">
          <CloseIcon />
        </Button>
      </BannerActions>
    </Banner>
    <Text styleAs="h1">Header</Text>
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
