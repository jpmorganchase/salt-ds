import { FC } from "react";
import { Link, StackLayout, SaltProvider } from "@salt-ds/core";
import { Banner, BannerProps } from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";

export default {
  title: "Lab/Banner/QA",
  component: Banner,
} as ComponentMeta<typeof Banner>;

const BasicBannerExample: FC<BannerProps> = ({ status }) => {
  return (
    <div style={{ width: "95%", minWidth: "60vw" }}>
      {
        <Banner
          onClose={() => console.log("close")}
          render={({ Icon, getIconProps, getLabelProps, getLinkProps }) => (
            <>
              <Icon {...getIconProps()} aria-label={"Success"} />
              <span {...getLabelProps()}>
                Example custom renderer
                <Link {...getLinkProps()}>link</Link>
              </span>
            </>
          )}
          status={status}
        />
      }
    </div>
  );
};

const InfoBanner = () => <BasicBannerExample status={"info"} />;
const ErrorBanner = () => <BasicBannerExample status={"error"} />;
const WarningBanner = () => <BasicBannerExample status={"warning"} />;
const SuccessBanner = () => <BasicBannerExample status={"success"} />;

export const ExamplesGrid: Story = () => (
  <StackLayout gap={2}>
    <SaltProvider applyClassesTo={"child"} density={"high"} mode={"light"}>
      <div className="saltBannerContainerExample">
        <InfoBanner />
      </div>
    </SaltProvider>
    <SaltProvider applyClassesTo={"child"} density={"medium"} mode={"dark"}>
      <div className="saltBannerContainerExample">
        <ErrorBanner />
      </div>
    </SaltProvider>
    <SaltProvider applyClassesTo={"child"} density={"low"} mode={"light"}>
      <div className="saltBannerContainerExample">
        <WarningBanner />
      </div>
    </SaltProvider>
    <SaltProvider applyClassesTo={"child"} density={"touch"} mode={"dark"}>
      <div className="saltBannerContainerExample">
        <SuccessBanner />
      </div>
    </SaltProvider>
  </StackLayout>
);

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
