import type { LayoutProps } from "@jpmorganchase/mosaic-layouts";
import { type SiteState, useStore } from "@jpmorganchase/mosaic-store";
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
import { ThemeControls } from "../../components/components/ThemeControls";
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
};

type CustomSiteState = SiteState & { data?: Data };

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
        {children}
      </Base>
    </LivePreviewProvider>
  );
};
