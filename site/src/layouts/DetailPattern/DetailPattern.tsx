import type { LayoutProps } from "@jpmorganchase/mosaic-layouts";
import {
  type SiteState,
  useRoute,
  useStore,
} from "@jpmorganchase/mosaic-store";
import {
  Button,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
} from "@salt-ds/core";
import { SettingsSolidIcon } from "@salt-ds/icons";
import type { FC } from "react";
import { LivePreviewProvider } from "../../components";
import { workflowPreviewForRoute } from "../../components/components/patternSourceLoaders";
import { ThemeControls } from "../../components/components/ThemeControls";
import { WorkflowPreview } from "../../components/components/WorkflowPreview";
import { PageNavigation } from "../../components/navigation/PageNavigation";
import { TableOfContents } from "../../components/toc";
import { Base } from "../Base/index";
import { PageHeading, type PageHeadingProps } from "../Base/PageHeading";
import { PrimarySidebar } from "../Base/PrimarySidebar";
import { SecondarySidebar } from "../Base/SecondarySidebar";
import { Components } from "./Components";
import styles from "./DetailPattern.module.css";
import { RelatedPatterns } from "./RelatedPatterns";
import { Resources } from "./Resources";

type Data = {
  showThemeControl?: boolean;
  resources?: Array<{ href: string }>;
};

type CustomSiteState = SiteState & { data?: Data };
const offlineAuthorPreview =
  process.env.NEXT_PUBLIC_SALT_OFFLINE_AUTHOR_PREVIEW === "1";

function PatternPageHeading({
  title,
  description,
  id,
}: PageHeadingProps): JSX.Element {
  const showThemeControl =
    useStore((state: CustomSiteState) => state.data?.showThemeControl) ?? false;

  return (
    <PageHeading title={title} description={description} id={id}>
      <div className={styles.headingActions}>
        {showThemeControl && (
          <Overlay>
            <OverlayTrigger>
              <Button
                sentiment="neutral"
                appearance="bordered"
                aria-label="Theme Controls"
              >
                <SettingsSolidIcon aria-hidden />
              </Button>
            </OverlayTrigger>
            <OverlayPanel className={styles.overlay}>
              <OverlayPanelContent>
                <ThemeControls />
              </OverlayPanelContent>
            </OverlayPanel>
          </Overlay>
        )}
      </div>
    </PageHeading>
  );
}

export const DetailPattern: FC<LayoutProps> = ({ children }) => {
  const { route } = useRoute();
  const workflowPreview = offlineAuthorPreview
    ? workflowPreviewForRoute(route)
    : undefined;
  const hasStorybookConsumerLink =
    useStore((state: CustomSiteState) =>
      state.data?.resources?.some((resource) =>
        /(?:^|\.)storybook\./iu.test(resource.href),
      ),
    ) ?? false;
  if (hasStorybookConsumerLink) {
    throw new Error(
      "Public pattern resources must use canonical inline or source examples, not Storybook.",
    );
  }
  const LeftSidebar = (
    <PrimarySidebar>
      <PageNavigation />
    </PrimarySidebar>
  );

  const RightSidebar = (
    <SecondarySidebar>
      <TableOfContents />
      <Components />
      <RelatedPatterns />
      <Resources />
    </SecondarySidebar>
  );

  return (
    <LivePreviewProvider>
      <Base
        LeftSidebar={LeftSidebar}
        RightSidebar={RightSidebar}
        Heading={PatternPageHeading}
      >
        {workflowPreview ? (
          <div className={styles.workflowContent}>
            <WorkflowPreview registration={workflowPreview} />
            <a className={styles.referenceLink} href="#primitive-reference">
              Browse the Forms pattern reference
            </a>
            <div id="primitive-reference">{children}</div>
          </div>
        ) : (
          children
        )}
      </Base>
    </LivePreviewProvider>
  );
};
