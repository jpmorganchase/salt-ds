import { FC } from "react";
import { Button, Link, StackLayout, SaltProvider } from "@salt-ds/core";
import {
  Banner,
  BannerProps,
  BannerContent,
  BannerActions,
} from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import { CloseIcon } from "@salt-ds/icons";

export default {
  title: "Lab/Banner/QA",
  component: Banner,
} as ComponentMeta<typeof Banner>;

const BasicBannerExample: FC<BannerProps> = ({ status }) => {
  return (
    <Banner status={status}>
      <BannerContent>
        Example custom renderer <Link href={"#"}>link</Link>
      </BannerContent>
      <BannerActions>
        <Button aria-label="refresh" variant="secondary">
          <CloseIcon />
        </Button>
      </BannerActions>
    </Banner>
  );
};

const InfoBanner = () => <BasicBannerExample status={"info"} />;
const ErrorBanner = () => <BasicBannerExample status={"error"} />;
const WarningBanner = () => <BasicBannerExample status={"warning"} />;
const SuccessBanner = () => <BasicBannerExample status={"success"} />;

export const ExamplesGrid: Story = () => (
  <StackLayout gap={2}>
    <SaltProvider applyClassesTo={"child"} density={"high"} mode={"light"}>
      <div style={{ width: "60vw" }}>
        <InfoBanner />
      </div>
    </SaltProvider>
    <SaltProvider applyClassesTo={"child"} density={"medium"} mode={"dark"}>
      <div style={{ width: "60vw" }}>
        <ErrorBanner />
      </div>
    </SaltProvider>
    <SaltProvider applyClassesTo={"child"} density={"low"} mode={"light"}>
      <div style={{ width: "60vw" }}>
        <WarningBanner />
      </div>
    </SaltProvider>
    <SaltProvider applyClassesTo={"child"} density={"touch"} mode={"dark"}>
      <div style={{ width: "60vw" }}>
        <SuccessBanner />
      </div>
    </SaltProvider>
  </StackLayout>
);

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
