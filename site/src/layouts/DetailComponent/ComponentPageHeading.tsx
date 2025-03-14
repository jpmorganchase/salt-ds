import { useStore } from "@jpmorganchase/mosaic-store";
import {
  Button,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { GithubIcon, SettingsSolidIcon } from "@salt-ds/icons";
import { CTALink } from "../../components/cta-link/CTALink";
import { useLivePreviewControls } from "../../components/index";
import { PageHeading } from "../Base/PageHeading";
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

export default function ComponentPageHeading({ title }: { title?: string }) {
  const {
    description,
    sourceCodeUrl,
    alsoKnownAs = [],
  } = useStore((state: CustomSiteState) => state.data ?? {});

  return (
    <PageHeading title={title} description={description}>
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
    </PageHeading>
  );
}
