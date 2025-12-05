import { useStore } from "@jpmorganchase/mosaic-store";
import {
  Button,
  FlexLayout,
  H1,
  Link,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  SplitLayout,
  type StackLayoutProps,
  Tag,
  Text,
  Tooltip,
  useResponsiveProp,
} from "@salt-ds/core";
import { FigmaIcon, GithubIcon, SettingsIcon } from "@salt-ds/icons";
import { Table, TBody, TD, TH, TR } from "@salt-ds/lab";
import dynamic from "next/dynamic";
import type { ElementType } from "react";
import { ThemeControls } from "../../components/components/ThemeControls";
import { CTALink } from "../../components/cta-link/CTALink";
import { LinkBase } from "../../components/link/Link";
import type { PageHeadingProps } from "../Base/PageHeading";
import headingStyles from "./ComponentPageHeading.module.css";
import type { CustomSiteState } from "./DetailComponent";
import styles from "./DetailComponent.module.css";

const Markdown = dynamic(() => import("../../components/markdown/Markdown"));

export default function ComponentPageHeading({ title, id }: PageHeadingProps) {
  const {
    description,
    sourceCodeUrl,
    figmaUrl,
    alsoKnownAs = [],
    status,
    package: saltPackage,
    externalDependency,
  } = useStore((state: CustomSiteState) => state.data ?? {});

  const hidePackageInfo = !saltPackage && !externalDependency;
  const isReleaseCandidate = status?.toLowerCase() === "release candidate";

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  return (
    <div id={id} className={headingStyles.root}>
      <div className={headingStyles.content}>
        <FlexLayout
          align={direction === "row" ? "center" : "start"}
          gap={1}
          direction={direction}
        >
          <H1 styleAs="display4">{title}</H1>
          <FlexLayout gap={1} wrap>
            {isReleaseCandidate && (
              <Tag bordered category={4}>
                Release candidate
              </Tag>
            )}
            {externalDependency && (
              <Link
                className={headingStyles.externalDepLink}
                href="/salt/about/glossary#external-dependency"
                render={
                  <LinkBase href="/salt/about/glossary#external-dependency" />
                }
              >
                <Tag bordered>External dependency</Tag>
              </Link>
            )}
            {externalDependency?.licenseRequired === true && (
              <Tag bordered category={2}>
                License required
              </Tag>
            )}
          </FlexLayout>
        </FlexLayout>
        {description && (
          <Text className={headingStyles.description}>
            <Markdown>{description}</Markdown>
          </Text>
        )}
        {externalDependency?.description && (
          <Text>
            <Markdown>{externalDependency.description}</Markdown>
          </Text>
        )}
        {alsoKnownAs.length > 0 && (
          <Text>
            Also known as: <small>{alsoKnownAs.join(", ")}</small>
          </Text>
        )}

        {!hidePackageInfo && (
          <Table
            variant="secondary"
            className={headingStyles.packageContainter}
          >
            <TBody>
              {saltPackage?.name && (
                <TR>
                  <TH scope="row">Package</TH>
                  <TD>{saltPackage.name}</TD>
                </TR>
              )}
              {saltPackage?.initialVersion && (
                <TR>
                  <TH scope="row">Version</TH>
                  <TD>{saltPackage.initialVersion}</TD>
                </TR>
              )}
              {externalDependency && (
                <TR>
                  <TH scope="row">External dependency</TH>
                  <TD>
                    {externalDependency.name && externalDependency.url ? (
                      <Link
                        href={externalDependency.url}
                        render={
                          <LinkBase
                            href={externalDependency.url}
                            target="_blank"
                            rel="noopener"
                          />
                        }
                      >
                        {externalDependency.name}
                      </Link>
                    ) : (
                      externalDependency.name
                    )}
                  </TD>
                </TR>
              )}
              {externalDependency?.compatibleVersions && (
                <TR>
                  <TH scope="row">Compatible versions</TH>
                  <TD>{externalDependency?.compatibleVersions}</TD>
                </TR>
              )}
            </TBody>
          </Table>
        )}

        {(sourceCodeUrl || figmaUrl) && (
          <SplitLayout
            gap={1}
            startItem={
              <FlexLayout gap={1}>
                {sourceCodeUrl && (
                  <CTALink
                    appearance="bordered"
                    sentiment="neutral"
                    href={sourceCodeUrl}
                    target="_blank"
                    rel="noopener"
                  >
                    <GithubIcon aria-hidden /> View code
                  </CTALink>
                )}
                {figmaUrl && (
                  <CTALink
                    appearance="bordered"
                    sentiment="neutral"
                    href={figmaUrl}
                    target="_blank"
                    rel="noopener"
                  >
                    <FigmaIcon aria-hidden /> View design
                  </CTALink>
                )}
              </FlexLayout>
            }
            endItem={
              <Overlay>
                <Tooltip aria-hidden="true" content="Theme controls">
                  <OverlayTrigger>
                    <Button
                      aria-label="Theme controls"
                      sentiment="neutral"
                      appearance="transparent"
                    >
                      <SettingsIcon aria-hidden />
                    </Button>
                  </OverlayTrigger>
                </Tooltip>
                <OverlayPanel className={styles.overlay}>
                  <OverlayPanelContent>
                    <ThemeControls />
                  </OverlayPanelContent>
                </OverlayPanel>
              </Overlay>
            }
          />
        )}
      </div>
    </div>
  );
}
