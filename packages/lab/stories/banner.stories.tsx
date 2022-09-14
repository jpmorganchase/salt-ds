import { Banner, State } from "@jpmorganchase/uitk-lab";

import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FC, ReactNode, useState } from "react";
import { Panel, ToolkitProvider } from "@jpmorganchase/uitk-core";
import {
  ColumnLayoutContainer,
  ColumnLayoutItem,
} from "@jpmorganchase/uitk-core/stories";
import { SuccessTickIcon } from "@jpmorganchase/uitk-icons";

export default {
  title: "Lab/Banner",
  component: Banner,
} as ComponentMeta<typeof Banner>;

interface ExampleRowProps {
  children: ReactNode;
  name: string;
}

const ExampleRow: FC<ExampleRowProps> = ({ name, children }) => (
  <Panel style={{ height: "unset" }}>
    <h1>{name} - ( Touch, Low, Medium, High )</h1>
    <ColumnLayoutContainer>
      <ColumnLayoutItem>
        Touch
        <ToolkitProvider density="touch">{children}</ToolkitProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        Low
        <ToolkitProvider density="low">{children}</ToolkitProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        Medium
        <ToolkitProvider density="medium">{children}</ToolkitProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        High
        <ToolkitProvider density="high">{children}</ToolkitProvider>
      </ColumnLayoutItem>
    </ColumnLayoutContainer>
  </Panel>
);

const Examples = () => (
  <>
    <ExampleRow name="Info">
      <Info />
    </ExampleRow>
    <ExampleRow name="Error">
      <Error />
    </ExampleRow>
    <ExampleRow name="Warning">
      <Warning />
    </ExampleRow>
    <ExampleRow name="Success">
      <Success />
    </ExampleRow>
  </>
);

export const All: ComponentStory<typeof Banner> = () => (
  <div
    style={{
      height: "100%",
      overflowY: "scroll",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    }}
  >
    <Examples />
  </div>
);

const ExampleBanner = ({ state }: { state: State }) => {
  const [showBanner, setShowBanner] = useState(true);

  const handleClose = () => {
    setShowBanner(false);
  };

  return (
    <div style={{ width: "95%", minWidth: "60vw" }}>
      {showBanner && (
        <Banner
          //eslint-disable-next-line no-script-url
          LinkProps={{ href: "javascript:void(0)" }}
          onClose={handleClose}
          state={state}
        >
          Banners appear inline on the page
        </Banner>
      )}
    </div>
  );
};

export const Info: ComponentStory<typeof Banner> = () => {
  return <ExampleBanner state={"info"} />;
};

export const Error: ComponentStory<typeof Banner> = () => {
  return <ExampleBanner state={"error"} />;
};

export const Warning: ComponentStory<typeof Banner> = () => {
  return <ExampleBanner state={"warning"} />;
};

export const Success: ComponentStory<typeof Banner> = () => {
  return <ExampleBanner state={"success"} />;
};

export const Render = () => {
  const [showBanner, setShowBanner] = useState(true);

  const handleClose = () => {
    setShowBanner(false);
  };

  return (
    <div style={{ width: "95%", minWidth: "60vw" }}>
      {showBanner && (
        <Banner
          onClose={handleClose}
          render={({ getLabelProps, getIconProps, getLinkProps }) => (
            <>
              <SuccessTickIcon {...getIconProps()} aria-label={"Success"} />
              <span {...getLabelProps()}>Example custom renderer</span>
              <a {...getLinkProps()}>link</a>
            </>
          )}
          state="success"
        />
      )}
    </div>
  );
};
