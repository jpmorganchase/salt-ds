import { useStore } from "@jpmorganchase/mosaic-store";
import {
  Button,
  H1,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
  Tag,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { GithubIcon, SettingsSolidIcon } from "@salt-ds/icons";
import dynamic from "next/dynamic";
import { CTALink } from "../../components/cta-link/CTALink";
import { useLivePreviewControls } from "../../components/index";
import { LinkBase } from "../../components/link/Link";
import type { PageHeadingProps } from "../Base/PageHeading";
import headingStyles from "./ComponentPageHeading.module.css";
import type { CustomSiteState } from "./DetailComponent";
import styles from "./DetailComponent.module.css";

function ThemeControls() {
  const { density, mode, theme, setDensity, setMode, setTheme } =
    useLivePreviewControls();

  return (
    <StackLayout gap={1} padding={{ md: 1 }}>
      <StackLayout gap={0.75} align="baseline" padding={0}>
        <Text styleAs="label" color="secondary">
          <strong>Density</strong>
        </Text>
        <ToggleButtonGroup
          className={styles.toggleGroup}
          aria-label="Select density"
          value={density}
          onChange={(event) => setDensity(event.currentTarget.value as any)}
        >
          <ToggleButton value="high">High</ToggleButton>
          <ToggleButton value="medium">Medium</ToggleButton>
          <ToggleButton value="low">Low</ToggleButton>
          <ToggleButton value="touch">Touch</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
      <StackLayout gap={0.75} align="baseline" padding={0}>
        <Text styleAs="label" color="secondary">
          <strong>Mode</strong>
        </Text>
        <ToggleButtonGroup
          className={styles.toggleGroup}
          aria-label="Select mode"
          onChange={(event) => setMode(event.currentTarget.value as any)}
          value={mode}
        >
          <ToggleButton value="system">System</ToggleButton>
          <ToggleButton value="light">Light</ToggleButton>
          <ToggleButton value="dark">Dark</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
      <StackLayout gap={0.75} align="baseline" padding={0}>
        <Text styleAs="label" color="secondary">
          <strong>Themes</strong>
        </Text>

        <ToggleButtonGroup
          className={styles.toggleGroup}
          aria-label="Select themes"
          onChange={(event) => setTheme(event.currentTarget.value as any)}
          value={theme}
        >
          <ToggleButton value="legacy">Legacy</ToggleButton>
          <ToggleButton value="brand">JPM Brand</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
    </StackLayout>
  );
}

const Markdown = dynamic(import("../../components/markdown/Markdown"));

const statusMapToCategory = {
  "Lab component": 11,
};

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
