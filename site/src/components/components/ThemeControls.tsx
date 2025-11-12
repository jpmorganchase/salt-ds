import {
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { useLivePreviewControls } from "./LivePreviewProvider";
import styles from "./ThemeControls.module.css";

export function ThemeControls() {
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
          <ToggleButton value="lab">Lab</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
    </StackLayout>
  );
}
