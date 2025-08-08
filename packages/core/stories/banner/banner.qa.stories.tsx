import {
  Banner,
  BannerActions,
  BannerContent,
  type BannerProps,
  Button,
  Link,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer } from "docs/components";
import type { FC } from "react";

export default {
  title: "Core/Banner/Banner QA",
  component: Banner,
} as Meta<typeof Banner>;

const BasicBannerExample: FC<BannerProps> = ({ status }) => {
  return (
    <Banner status={status}>
      <BannerContent>
        Example custom renderer <Link href={"#"}>link</Link>
      </BannerContent>
      <BannerActions>
        <Button aria-label="refresh" appearance="transparent">
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

export const ExamplesGrid: StoryFn = (props) => (
  <QAContainer cols={1} itemPadding={10} height={600} width={1000} {...props}>
    <InfoBanner />
    <ErrorBanner />
    <WarningBanner />
    <SuccessBanner />
  </QAContainer>
);

ExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
