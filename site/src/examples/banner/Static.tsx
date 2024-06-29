import { Banner, BannerContent } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Static = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <Banner status="warning">
      <BannerContent>
        This component will be deprecated in version 32.0.2.
      </BannerContent>
    </Banner>
  </div>
);
