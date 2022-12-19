import { useState } from "react";
import { Button, Density, ModeValues, SaltProvider } from "@salt-ds/core";
import {
  Card,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "@salt-ds/lab";

import "docs/story.css";

export default {
  title: "Core/Salt Provider",
  component: SaltProvider,
};

const LIGHT = 0;
const DARK = 1;

const HIGH = 0;
const NO_DENSITY = 4;

const DENSITIES: Density[] = ["high", "medium", "low", "touch"];

export const ToggleTheme = () => {
  const [mode, setMode] = useState(LIGHT);

  const handleChangeTheme: ToggleButtonGroupChangeEventHandler = (
    event,
    index
  ) => {
    setMode(index);
  };

  return (
    <SaltProvider mode={ModeValues[mode]}>
      <Card>
        <div>
          <h1>This Card is wrapped with a SaltProvider</h1>
          <ToggleButtonGroup onChange={handleChangeTheme} selectedIndex={mode}>
            <ToggleButton aria-label="light theme">Light</ToggleButton>
            <ToggleButton aria-label="dark theme">Dark</ToggleButton>
          </ToggleButtonGroup>
          <p>{`This Card is wrapped with a SaltProvider, mode is ${ModeValues[mode]}`}</p>

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
            <Button variant="cta">Continue</Button>
            <Button>Previous</Button>
            <Button variant="secondary">Upload File</Button>
          </div>
        </div>
        <br />
      </Card>
    </SaltProvider>
  );
};

export const NestedProviders = () => {
  const [outerMode, setOuterMode] = useState(LIGHT);
  const [outerDensity, setOuterDensity] = useState(HIGH);
  const [innerMode, setInnerMode] = useState(DARK);
  const [innerDensity, setInnerDensity] = useState(NO_DENSITY);

  const handleChangeOuterTheme: ToggleButtonGroupChangeEventHandler = (
    event,
    index
  ) => {
    setOuterMode(index);
  };

  const handleChangeOuterDensity: ToggleButtonGroupChangeEventHandler = (
    event,
    index
  ) => {
    setOuterDensity(index);
  };

  const handleChangeInnerTheme: ToggleButtonGroupChangeEventHandler = (
    event,
    index
  ) => {
    setInnerMode(index);
  };
  const handleChangeInnerDensity: ToggleButtonGroupChangeEventHandler = (
    event,
    index
  ) => {
    setInnerDensity(index);
  };

  return (
    <SaltProvider
      density={DENSITIES[outerDensity]}
      mode={ModeValues[outerMode]}
    >
      <Card>
        <div>
          <h1>This Card is wrapped with a SaltProvider</h1>
          <ToggleButtonGroup
            onChange={handleChangeOuterTheme}
            selectedIndex={outerMode}
          >
            <ToggleButton aria-label="light theme">Light</ToggleButton>
            <ToggleButton aria-label="dark theme">Dark</ToggleButton>
            <ToggleButton aria-label="no theme">Not set</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            onChange={handleChangeOuterDensity}
            selectedIndex={outerDensity}
          >
            <ToggleButton aria-label="high density">High</ToggleButton>
            <ToggleButton aria-label="medium density">Medium</ToggleButton>
            <ToggleButton aria-label="low density">Low</ToggleButton>
            <ToggleButton aria-label="touch density">Touch</ToggleButton>
            <ToggleButton aria-label="not set">Not set</ToggleButton>
          </ToggleButtonGroup>
          <p>
            This Card is wrapped with a SaltProvider, theme is light, density is
            high.
          </p>
        </div>
        <br />
        <SaltProvider
          mode={ModeValues[innerMode]}
          density={DENSITIES[innerDensity]}
        >
          <Card>
            <div>
              <h1>Nested Card</h1>
              <ToggleButtonGroup
                onChange={handleChangeInnerTheme}
                selectedIndex={innerMode}
              >
                <ToggleButton aria-label="light theme">Light</ToggleButton>
                <ToggleButton aria-label="dark theme">Dark</ToggleButton>
                <ToggleButton aria-label="dark theme">Not set</ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                onChange={handleChangeInnerDensity}
                selectedIndex={innerDensity}
              >
                <ToggleButton aria-label="high density">High</ToggleButton>
                <ToggleButton aria-label="medium density">Medium</ToggleButton>
                <ToggleButton aria-label="low density">Low</ToggleButton>
                <ToggleButton aria-label="touch density">Touch</ToggleButton>
                <ToggleButton aria-label="not set">Not set</ToggleButton>
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
