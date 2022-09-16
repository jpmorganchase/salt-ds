import { FC } from "react";
import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import { Banner, BannerProps, Link } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, Story } from "@storybook/react";

import "./banner.qa.stories.css";

export default {
  title: "Lab/Banner/QA",
  component: Banner,
} as ComponentMeta<typeof Banner>;

const BasicBannerExample: FC<BannerProps> = ({ state }) => {
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
          state={state}
        />
      }
    </div>
  );
};

const InfoBanner = () => <BasicBannerExample state={"info"} />;
const ErrorBanner = () => <BasicBannerExample state={"error"} />;
const WarningBanner = () => <BasicBannerExample state={"warning"} />;
const SuccessBanner = () => <BasicBannerExample state={"success"} />;

export const ExamplesGrid: Story = () => (
  <div className={"examples-container"}>
    <ToolkitProvider applyClassesToChild density={"high"} theme={"dark"}>
      <div>
        <InfoBanner />
      </div>
    </ToolkitProvider>
    <ToolkitProvider applyClassesToChild density={"medium"} theme={"dark"}>
      <div>
        <ErrorBanner />
      </div>
    </ToolkitProvider>
    <ToolkitProvider applyClassesToChild density={"low"} theme={"light"}>
      <div>
        <WarningBanner />
      </div>
    </ToolkitProvider>
    <ToolkitProvider applyClassesToChild density={"touch"} theme={"dark"}>
      <div>
        <SuccessBanner />
      </div>
    </ToolkitProvider>
  </div>
);

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
