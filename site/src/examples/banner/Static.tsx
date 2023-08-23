import { ReactElement } from "react";
import { Banner, BannerContent } from "@salt-ds/core";

export const Static = (): ReactElement => (
  <div style={{ width: 500 }}>
    <Banner>
      <BannerContent>This component is deprecated.</BannerContent>
    </Banner>
  </div>
);
