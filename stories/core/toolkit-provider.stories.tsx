import { useState } from "react";
import { Density, ToolkitProvider } from "@brandname/core";
import {
  Card,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "@brandname/lab";

import "../story.css";

export default {
  title: "Core/Toolkit Provider",
  component: ToolkitProvider,
};

const LIGHT = 0;
const DARK = 1;

const HIGH = 0;
const NO_DENSITY = 4;

const THEMES = ["light", "dark"];
const DENSITIES: Density[] = ["high", "medium", "low", "touch"];

export const NestedProviders = () => {
  const [outerTheme, setOuterTheme] = useState(LIGHT);
  const [outerDensity, setOuterDensity] = useState(HIGH);
  const [innerTheme, setInnerTheme] = useState(DARK);
  const [innerDensity, setInnerDensity] = useState(NO_DENSITY);

  const handleChangeOuterTheme: ToggleButtonGroupChangeEventHandler = (
    event,
    index
  ) => {
    setOuterTheme(index);
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
    setInnerTheme(index);
  };
  const handleChangeInnerDensity: ToggleButtonGroupChangeEventHandler = (
    event,
    index
  ) => {
    setInnerDensity(index);
  };

  return (
    <ToolkitProvider
      density={DENSITIES[outerDensity]}
      theme={THEMES[outerTheme]}
    >
      <Card>
        <div>
          <h1>This Card is wrapped with a ToolkitProvider</h1>
          <ToggleButtonGroup
            onChange={handleChangeOuterTheme}
            selectedIndex={outerTheme}
          >
            <ToggleButton ariaLabel="light theme">Light</ToggleButton>
            <ToggleButton ariaLabel="dark theme">Dark</ToggleButton>
            <ToggleButton ariaLabel="no theme">Not set</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            onChange={handleChangeOuterDensity}
            selectedIndex={outerDensity}
          >
            <ToggleButton ariaLabel="high density">High</ToggleButton>
            <ToggleButton ariaLabel="medium density">Medium</ToggleButton>
            <ToggleButton ariaLabel="low density">Low</ToggleButton>
            <ToggleButton ariaLabel="touch density">Touch</ToggleButton>
            <ToggleButton ariaLabel="not set">Not set</ToggleButton>
          </ToggleButtonGroup>
          <p>
            This Card is wrapped with a ToolkitProvider, theme is light, density
            is high.
          </p>
        </div>
        <br />
        <ToolkitProvider
          theme={THEMES[innerTheme]}
          density={DENSITIES[innerDensity]}
        >
          <Card>
            <div>
              <h1>Nested Card</h1>
              <ToggleButtonGroup
                onChange={handleChangeInnerTheme}
                selectedIndex={innerTheme}
              >
                <ToggleButton ariaLabel="light theme">Light</ToggleButton>
                <ToggleButton ariaLabel="dark theme">Dark</ToggleButton>
                <ToggleButton ariaLabel="dark theme">Not set</ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                onChange={handleChangeInnerDensity}
                selectedIndex={innerDensity}
              >
                <ToggleButton ariaLabel="high density">High</ToggleButton>
                <ToggleButton ariaLabel="medium density">Medium</ToggleButton>
                <ToggleButton ariaLabel="low density">Low</ToggleButton>
                <ToggleButton ariaLabel="touch density">Touch</ToggleButton>
                <ToggleButton ariaLabel="not set">Not set</ToggleButton>
              </ToggleButtonGroup>

              <p>
                This nested Card is also wrapped with a ToolkitProvider, theme
                is dark. Density is not specified, so inherits high value from
                outer ToolkitProvider
              </p>
            </div>
          </Card>
        </ToolkitProvider>
      </Card>
    </ToolkitProvider>
  );
};
