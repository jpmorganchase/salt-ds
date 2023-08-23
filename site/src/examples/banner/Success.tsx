import { ReactElement } from "react";
import { Banner, BannerContent } from "@salt-ds/core";

export const Success = (): ReactElement => (
  <Banner status="success" style={{ width: "80%" }}>
    <BannerContent role="status">Database updated</BannerContent>
  </Banner>
);
