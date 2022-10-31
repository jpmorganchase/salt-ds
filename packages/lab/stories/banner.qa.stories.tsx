import { FC } from "react";
import { StackLayout, ToolkitProvider } from "@jpmorganchase/uitk-core";
import { Banner, BannerProps, Link } from "@jpmorganchase/uitk-lab";
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
    <ToolkitProvider applyClassesToChild density={"high"} theme={"light"}>
      <div className="uitkBannerContainerExample">
        <InfoBanner />
      </div>
    </ToolkitProvider>
    <ToolkitProvider applyClassesToChild density={"medium"} theme={"dark"}>
      <div className="uitkBannerContainerExample">
        <ErrorBanner />
      </div>
    </ToolkitProvider>
    <ToolkitProvider applyClassesToChild density={"low"} theme={"light"}>
      <div className="uitkBannerContainerExample">
        <WarningBanner />
      </div>
    </ToolkitProvider>
    <ToolkitProvider applyClassesToChild density={"touch"} theme={"dark"}>
      <div className="uitkBannerContainerExample">
        <SuccessBanner />
      </div>
    </ToolkitProvider>
  </StackLayout>
);

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
