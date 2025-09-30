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
        There has been an update to the&nbsp;
        <Link href="#">Terms and Conditions</Link>.
      </BannerContent>
      <BannerActions>
        <Button aria-label="close" appearance="transparent">
          <CloseIcon />
        </Button>
      </BannerActions>
    </Banner>
    <Text styleAs="h1">Header</Text>
    <Text>
      This placeholder text is provided to illustrate how content will appear
      within the component. The sentences are intended for demonstration only
      and do not convey specific information. Generic examples like this help
      review layout, spacing, and overall design. Adjust the wording as needed
      to fit your use case or display requirements.
    </Text>
  </StackLayout>
);
