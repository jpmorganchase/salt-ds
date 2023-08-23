import { ReactElement } from "react";
import {
  Banner,
  BannerActions,
  BannerContent,
  Button,
  Link,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export const Interactive = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <Banner status="warning">
      <BannerContent>
        Unfortunately this release contains some serious bugs in the List
        Builder component. These have been fixed in{" "}
        <Link href="./32.1.0">v32.1.0</Link> so we recommend skipping this
        release and upgrading directly to <Link href="./32.1.0">v32.1.0</Link>{" "}
        or later.
      </BannerContent>
      <BannerActions>
        <Button aria-label="close" variant="secondary">
          <CloseIcon />
        </Button>
      </BannerActions>
    </Banner>
  </div>
);
