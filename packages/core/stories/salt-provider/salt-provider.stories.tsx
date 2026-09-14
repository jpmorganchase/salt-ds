import {
  Button,
  Card,
  Checkbox,
  type Density,
  GridLayout,
  H1,
  type Mode,
  SaltProvider,
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { type SyntheticEvent, useState } from "react";

import "docs/story.css";

export default {
  title: "Core/Salt Provider",
  component: SaltProvider,
};

export const Default = () => {
  return (
    <SaltProvider density="high" mode="light">
      <Card>
        <StackLayout>
          <H1>This is Card</H1>
          <Text>Using Nested DOM Elements</Text>
        </StackLayout>
      </Card>
    </SaltProvider>
  );
};

export const ToggleTheme = () => {
  const [mode, setMode] = useState<Mode>("light");

  const handleChangeTheme = (event: SyntheticEvent<HTMLButtonElement>) => {
    setMode(event.currentTarget.value as Mode);
  };

  return (
    <SaltProvider mode={mode}>
      <Card>
        <StackLayout>
          <H1>This Card is wrapped with a SaltProvider</H1>
          <ToggleButtonGroup onChange={handleChangeTheme} value={mode}>
            <ToggleButton aria-label="light theme" value="light">
              Light
            </ToggleButton>
            <ToggleButton aria-label="dark theme" value="dark">
              Dark
            </ToggleButton>
          </ToggleButtonGroup>
          <Text>{`This Card is wrapped with a SaltProvider, mode is ${mode}`}</Text>
          <StackLayout gap={1}>
            <Checkbox label="Example Choice 1" />
            <Checkbox defaultChecked label="Example Choice 2" />
            <Checkbox defaultChecked indeterminate label="Example Choice 3" />
          </StackLayout>
          <GridLayout columns={3} gap={1}>
            <Button sentiment="accented">Continue</Button>
            <Button>Previous</Button>
            <Button appearance="transparent">Upload File</Button>
          </GridLayout>
        </StackLayout>
      </Card>
    </SaltProvider>
  );
};

export const NestedProviders = () => {
  const [outerMode, setOuterMode] = useState<Mode | "unset">("light");
  const [outerDensity, setOuterDensity] = useState<Density | "unset">("high");
  const [innerMode, setInnerMode] = useState<Mode | "unset">("dark");
  const [innerDensity, setInnerDensity] = useState<Density | "unset">("unset");

  const handleChangeOuterTheme = (event: SyntheticEvent<HTMLButtonElement>) => {
    setOuterMode(event.currentTarget.value as Mode);
  };

  const handleChangeOuterDensity = (
    event: SyntheticEvent<HTMLButtonElement>,
  ) => {
    setOuterDensity(event.currentTarget.value as Density);
  };

  const handleChangeInnerTheme = (event: SyntheticEvent<HTMLButtonElement>) => {
    setInnerMode(event.currentTarget.value as Mode);
  };
  const handleChangeInnerDensity = (
    event: SyntheticEvent<HTMLButtonElement>,
  ) => {
    setInnerDensity(event.currentTarget.value as Density);
  };

  return (
    <SaltProvider
      density={outerDensity === "unset" ? undefined : outerDensity}
      mode={outerMode === "unset" ? undefined : outerMode}
    >
      <Card>
        <StackLayout>
          <H1>This Card is wrapped with a SaltProvider</H1>
          <StackLayout gap={1}>
            <ToggleButtonGroup
              aria-label="Outer theme selection"
              onChange={handleChangeOuterTheme}
              value={outerMode}
            >
              <ToggleButton value="light">Light</ToggleButton>
              <ToggleButton value="dark">Dark</ToggleButton>
              <ToggleButton value="unset">Not set</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
              aria-label="Outer density selection"
              onChange={handleChangeOuterDensity}
              value={outerDensity}
            >
              <ToggleButton value="high">High</ToggleButton>
              <ToggleButton value="medium">Medium</ToggleButton>
              <ToggleButton value="low">Low</ToggleButton>
              <ToggleButton value="touch">Touch</ToggleButton>
              <ToggleButton value="unset">Not set</ToggleButton>
            </ToggleButtonGroup>
          </StackLayout>
          <Text>
            This Card is wrapped with a SaltProvider, theme is light, density is
            high.
          </Text>
          <SaltProvider
            mode={innerMode === "unset" ? undefined : innerMode}
            density={innerDensity === "unset" ? undefined : innerDensity}
          >
            <Card>
              <StackLayout>
                <H1>Nested Card</H1>
                <StackLayout gap={1}>
                  <ToggleButtonGroup
                    aria-label="Inner theme selection"
                    onChange={handleChangeInnerTheme}
                    value={innerMode}
                  >
                    <ToggleButton value="light">Light</ToggleButton>
                    <ToggleButton value="dark">Dark</ToggleButton>
                    <ToggleButton value="unset">Not set</ToggleButton>
                  </ToggleButtonGroup>
                  <ToggleButtonGroup
                    aria-label="Inner density selection"
                    onChange={handleChangeInnerDensity}
                    value={innerDensity}
                  >
                    <ToggleButton value="high">High</ToggleButton>
                    <ToggleButton value="medium">Medium</ToggleButton>
                    <ToggleButton value="low">Low</ToggleButton>
                    <ToggleButton value="touch">Touch</ToggleButton>
                    <ToggleButton value="unset">Not set</ToggleButton>
                  </ToggleButtonGroup>
                </StackLayout>
                <Text>
                  This nested Card is also wrapped with a SaltProvider, theme is
                  dark. Density is not specified, so inherits high value from
                  outer SaltProvider
                </Text>
              </StackLayout>
            </Card>
          </SaltProvider>
        </StackLayout>
      </Card>
    </SaltProvider>
  );
};
