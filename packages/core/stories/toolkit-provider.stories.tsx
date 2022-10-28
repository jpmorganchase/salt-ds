import { useState } from "react";
import { Card, Density, ToolkitProvider } from "@jpmorganchase/uitk-core";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "@jpmorganchase/uitk-lab";

import "docs/story.css";

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
