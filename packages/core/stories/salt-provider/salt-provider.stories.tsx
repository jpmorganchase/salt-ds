import {
  BrandName,
  Button,
  Card,
  Checkbox,
  type Density,
  FlexLayout,
  H1,
  type Mode,
  SaltProvider,
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
        <div>
          <h1>This is Card</h1>
          <span>Using Nested DOM Elements</span>
        </div>
      </Card>
    </SaltProvider>
  );
};

export const ToggleBrandAndMode = () => {
  const [brand, setBrand] = useState<BrandName>("legacy");
  const [mode, setMode] = useState<Mode>("light");

  const handleChangeBrand = (event: SyntheticEvent<HTMLButtonElement>) => {
    setBrand(event.currentTarget.value as BrandName);
  };

  const handleChangeTheme = (event: SyntheticEvent<HTMLButtonElement>) => {
    setMode(event.currentTarget.value as Mode);
  };

  return (
    <SaltProvider brand={brand} mode={mode}>
      <Card>
        <div>
          <H1>This Card is wrapped with a SaltProvider</H1>
          <FlexLayout>
            <ToggleButtonGroup onChange={handleChangeBrand} value={brand}>
              <ToggleButton aria-label="legacy brand" value="legacy">
                Legacy
              </ToggleButton>
              <ToggleButton aria-label="jpmc brand" value="jpmc">
                JPMC
              </ToggleButton>
            </ToggleButtonGroup>
              <ToggleButtonGroup onChange={handleChangeTheme} value={mode}>
              <ToggleButton aria-label="light theme" value="light">
                Light
              </ToggleButton>
              <ToggleButton aria-label="dark theme" value="dark">
                Dark
              </ToggleButton>
            </ToggleButtonGroup>
          </FlexLayout>
          <p>{`This Card is wrapped with a SaltProvider, brand is ${brand}, mode is ${mode}`}</p>

          <Checkbox label="Example Choice 1" />
          <Checkbox defaultChecked label="Example Choice 2" />
          <Checkbox defaultChecked indeterminate label="Example Choice 3" />
          <br />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto auto",
              gridTemplateRows: "auto",
              gridGap: 10,
            }}
          >
            <Button sentiment="accented">Continue</Button>
            <Button>Previous</Button>
            <Button appearance="transparent">Upload File</Button>
          </div>
        </div>
        <br />
      </Card>
    </SaltProvider>
  );
};

export const ToggleMode = () => {
  const [mode, setMode] = useState<Mode>("light");

  const handleChangeTheme = (event: SyntheticEvent<HTMLButtonElement>) => {
    setMode(event.currentTarget.value as Mode);
  };

  return (
    <SaltProvider mode={mode}>
      <Card>
        <div>
          <h1>This Card is wrapped with a SaltProvider</h1>
          <ToggleButtonGroup onChange={handleChangeTheme} value={mode}>
            <ToggleButton aria-label="light theme" value="light">
              Light
            </ToggleButton>
            <ToggleButton aria-label="dark theme" value="dark">
              Dark
            </ToggleButton>
          </ToggleButtonGroup>
          <p>{`This Card is wrapped with a SaltProvider, mode is ${mode}`}</p>

          <Checkbox label="Example Choice 1" />
          <Checkbox defaultChecked label="Example Choice 2" />
          <Checkbox defaultChecked indeterminate label="Example Choice 3" />
          <br />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto auto",
              gridTemplateRows: "auto",
              gridGap: 10,
            }}
          >
            <Button sentiment="accented">Continue</Button>
            <Button>Previous</Button>
            <Button appearance="transparent">Upload File</Button>
          </div>
        </div>
        <br />
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
        <div>
          <h1>This Card is wrapped with a SaltProvider</h1>
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
          <p>
            This Card is wrapped with a SaltProvider, theme is light, density is
            high.
          </p>
        </div>
        <br />
        <SaltProvider
          mode={innerMode === "unset" ? undefined : innerMode}
          density={innerDensity === "unset" ? undefined : innerDensity}
        >
          <Card>
            <div>
              <h1>Nested Card</h1>
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

              <p>
                This nested Card is also wrapped with a SaltProvider, theme is
                dark. Density is not specified, so inherits high value from
                outer SaltProvider
              </p>
            </div>
          </Card>
        </SaltProvider>
      </Card>
    </SaltProvider>
  );
};
