import { ReactElement } from "react";
import { Banner, BannerContent } from "@salt-ds/core";

export const Static = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <Banner>
      <BannerContent>This component is deprecated.</BannerContent>
    </Banner>
  </div>
);
