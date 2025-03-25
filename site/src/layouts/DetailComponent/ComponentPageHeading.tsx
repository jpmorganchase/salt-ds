import { useStore } from "@jpmorganchase/mosaic-store";
import {
  Button,
  H1,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  Tag,
  Text,
} from "@salt-ds/core";
import { GithubIcon, SettingsSolidIcon } from "@salt-ds/icons";
import dynamic from "next/dynamic";
import { ThemeControls } from "../../components/components/ThemeControls";
import { CTALink } from "../../components/cta-link/CTALink";
import { LinkBase } from "../../components/link/Link";
import type { PageHeadingProps } from "../Base/PageHeading";
import headingStyles from "./ComponentPageHeading.module.css";
import type { CustomSiteState } from "./DetailComponent";
import styles from "./DetailComponent.module.css";

const Markdown = dynamic(import("../../components/markdown/Markdown"));

export default function ComponentPageHeading({ title, id }: PageHeadingProps) {
  const {
    description,
    sourceCodeUrl,
    alsoKnownAs = [],
    status,
  } = useStore((state: CustomSiteState) => state.data ?? {});

  return (
    <div id={id} className={headingStyles.root}>
      <div className={headingStyles.content}>
        <div className={headingStyles.title}>
          <H1 styleAs={"display4"}>{title}</H1>
          {status === "Release candidate" && (
            <LinkBase
              className={headingStyles.tagLink}
              href="/salt/components/index#lab-components"
            >
              <Tag bordered>Release candidate</Tag>
            </LinkBase>
          )}
        </div>
        {description && (
          <Text className={headingStyles.description}>
            <Markdown>{description}</Markdown>
          </Text>
        )}
        {alsoKnownAs.length > 0 && (
          <Text>
            Also known as: <small>{alsoKnownAs.join(", ")}</small>
          </Text>
        )}

        {sourceCodeUrl && (
          <div className={styles.headingActions}>
            <CTALink
              appearance="bordered"
              sentiment="neutral"
              href={sourceCodeUrl}
            >
              <GithubIcon aria-hidden /> View source code
            </CTALink>
            <Overlay>
              <OverlayTrigger>
                <Button sentiment="neutral" appearance="bordered">
                  <SettingsSolidIcon aria-hidden />
                </Button>
              </OverlayTrigger>
              <OverlayPanel className={styles.overlay}>
                <OverlayPanelContent>
                  <ThemeControls />
                </OverlayPanelContent>
              </OverlayPanel>
            </Overlay>
          </div>
        )}
      </div>
    </div>
  );
}
