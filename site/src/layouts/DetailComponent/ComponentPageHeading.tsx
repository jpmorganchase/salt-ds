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
import {
  ChevronDownIcon,
  FigmaIcon,
  GithubIcon,
  SettingsIcon,
} from "@salt-ds/icons";
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
  const isReleaseCandidate =
    status?.trim().toLowerCase() === "release candidate";

  const tags: Array<{ text: string; category: number; link?: string }> = [];
  if (isReleaseCandidate) {
    tags.push({
      text: "Release candidate",
      category: 14,
      link: "/salt/about/glossary#release-candidate-rc",
    });
  }
  if (externalDependency) {
    tags.push({
      text: "External dependency",
      category: 1,
      link: "/salt/about/glossary#external-dependency",
    });
    if (externalDependency.licenseRequired === true) {
      tags.push({
        text: "License required",
        category: 2,
        link: "https://go/saltds-license-resources",
      });
    }
  }

  const tableRows: Array<{ label: string; content: React.ReactNode }> = [];
  if (saltPackage?.name) {
    const nameContent = saltPackage.url ? (
      <Link
        render={
          <LinkBase href={saltPackage.url} target="_blank" rel="noopener" />
        }
      >
        {saltPackage.name}
      </Link>
    ) : (
      saltPackage.name
    );
    tableRows.push({ label: "Salt package", content: nameContent });
  }
  if (saltPackage?.initialVersion) {
    tableRows.push({
      label: "Available since",
      content: saltPackage.initialVersion,
    });
  }
  if (externalDependency?.name) {
    const nameContent = externalDependency.url ? (
      <Link
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
    );
    tableRows.push({ label: "External dependency", content: nameContent });
  }
  if (externalDependency?.compatibleVersions) {
    tableRows.push({
      label: "Compatible versions",
      content: externalDependency.compatibleVersions,
    });
  }

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
          <FlexLayout wrap gap={1} align="center">
            <H1 styleAs="display4">{title}</H1>
            <FlexLayout gap={1} wrap>
              {tags.map((tag) =>
                tag.link ? (
                  <LinkBase
                    key={tag.text}
                    className={headingStyles.externalDepLink}
                    href={tag.link}
                  >
                    <Tag bordered category={tag.category}>
                      {tag.text}
                    </Tag>
                  </LinkBase>
                ) : (
                  <Tag key={tag.text} bordered category={tag.category}>
                    {tag.text}
                  </Tag>
                ),
              )}
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
        {description && (
          <Markdown className={headingStyles.description}>
            {description}
          </Markdown>
        )}
        {externalDependency?.description && (
          <Markdown className={headingStyles.description}>
            {externalDependency.description}
          </Markdown>
        )}
        {alsoKnownAs.length > 0 && (
          <Text>
            Also known as: <small>{alsoKnownAs.join(", ")}</small>
          </Text>
        )}

        {!hidePackageInfo && (
          <Table
            variant="secondary"
            className={headingStyles.packageContainer}
            aria-label="Component package and dependency details"
          >
            <TBody>
              {tableRows.map(({ label, content }) => (
                <TR key={label}>
                  <TH scope="row">{label}</TH>
                  <TD>{content}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}

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
                  <GithubIcon aria-hidden />
                  Code
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
                  <FigmaIcon aria-hidden />
                  Design
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
                    appearance="bordered"
                  >
                    <SettingsIcon aria-hidden />
                    <ChevronDownIcon aria-hidden />
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
      </div>
    </div>
  );
}
