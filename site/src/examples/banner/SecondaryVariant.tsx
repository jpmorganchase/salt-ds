import { Banner, BannerContent, Link, StackLayout } from "@salt-ds/core";
import { ReactElement } from "react";

export const SecondaryVariant = (): ReactElement => (
  <StackLayout>
    <Banner variant="secondary" status="info">
      <BannerContent>
        There has been an update to the{" "}
        <Link href="#">Terms and Conditions</Link>.
      </BannerContent>
    </Banner>
    <Banner variant="secondary" status="error">
      <BannerContent>
        There was an error connecting to the server. Please click refresh to try
        again.
      </BannerContent>
    </Banner>
    <Banner variant="secondary" status="warning">
      <BannerContent>
        Your connection is unstable. Please proceed with caution.
      </BannerContent>
    </Banner>
    <Banner variant="secondary" status="success">
      <BannerContent>
        Your details have been updated successfully.
      </BannerContent>
    </Banner>
  </StackLayout>
);
