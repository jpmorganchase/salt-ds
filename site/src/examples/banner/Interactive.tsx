import { ReactElement } from "react";
import { Banner, BannerActions, BannerContent, Button } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export const Interactive = (): ReactElement => (
  <div style={{ width: 500 }}>
    <Banner status="warning">
      <BannerContent>
        Unfortunately this release contains some serious bugs in the List
        Builder component. These have been fixed in{" "}
        <a href="./32.1.0">v32.1.0</a> so we recommend skipping this release and
        upgrading directly to v32.1.0 or later.
      </BannerContent>
      <BannerActions>
        <Button aria-label="close" variant="secondary">
          <CloseIcon />
        </Button>
      </BannerActions>
    </Banner>
  </div>
);
