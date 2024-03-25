import {
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Density,
  H1,
  Mode,
  SaltProvider,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { ChangeEvent, ReactNode, SyntheticEvent, useState } from "react";

import "docs/story.css";
import "./salt-provider.stories.css";

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

export const ToggleTheme = () => {
  const [mode, setMode] = useState<Mode>("light");

  const handleChangeTheme = (event: SyntheticEvent<HTMLButtonElement>) => {
    setMode(event.currentTarget.value as Mode);
  };

  return (
    <SaltProvider mode={mode}>
      <Card>
        <div>
          <H1>This Card is wrapped with a SaltProvider</H1>
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

const getThemeName = (selectedTheme: string[]) => {
  if (selectedTheme.length === 0) {
    return undefined;
  } else if (selectedTheme.length === 1) {
    return selectedTheme[0];
  } else {
    return selectedTheme;
  }
};

const CardWithProvider = ({
  defaultMode,
  defaultDensity,
  children,
}: {
  defaultMode: Mode | "unset";
  defaultDensity: Density | "unset";
  children?: ReactNode;
}) => {
  const [mode, setMode] = useState(defaultMode);
  const [density, setDensity] = useState(defaultDensity);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  const handleChangeMode = (event: SyntheticEvent<HTMLButtonElement>) => {
    setMode(event.currentTarget.value as Mode);
  };
  const handleChangeDensity = (event: SyntheticEvent<HTMLButtonElement>) => {
    setDensity(event.currentTarget.value as Density);
  };

  const handleThemeNamesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (selectedThemes.indexOf(value) === -1) {
      setSelectedThemes((prevControlledValues) => [
        ...prevControlledValues,
        value,
      ]);
    } else {
      setSelectedThemes((prevControlledValues) =>
        prevControlledValues.filter(
          (controlledValue) => controlledValue !== value
        )
      );
    }
  };

  return (
    <SaltProvider
      mode={mode === "unset" ? undefined : mode}
      density={density === "unset" ? undefined : density}
      theme={getThemeName(selectedThemes)}
    >
      <Card>
        <div>
          <H1>Card with Salt Provider</H1>
          <ToggleButtonGroup
            aria-label="Theme selection"
            onChange={handleChangeMode}
            value={mode}
          >
            <ToggleButton value="light">Light</ToggleButton>
            <ToggleButton value="dark">Dark</ToggleButton>
            <ToggleButton value="unset">Not set</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            aria-label="Density selection"
            onChange={handleChangeDensity}
            value={density}
          >
            <ToggleButton value="high">High</ToggleButton>
            <ToggleButton value="medium">Medium</ToggleButton>
            <ToggleButton value="low">Low</ToggleButton>
            <ToggleButton value="touch">Touch</ToggleButton>
            <ToggleButton value="unset">Not set</ToggleButton>
          </ToggleButtonGroup>

          <CheckboxGroup
            checkedValues={selectedThemes}
            onChange={handleThemeNamesChange}
          >
            <Checkbox label="Custom font" value="custom-font" />
            <Checkbox label="No spacing" value="no-spacing" />
          </CheckboxGroup>

          <p>
            This Card is wrapped with SaltProvider, default mode is{" "}
            {defaultMode}, default density is {defaultDensity}
          </p>

          {children}
        </div>
      </Card>
    </SaltProvider>
  );
};

export const NestedProviders = () => {
  return (
    <CardWithProvider defaultMode="light" defaultDensity="high">
      <CardWithProvider defaultMode="dark" defaultDensity="unset" />
    </CardWithProvider>
  );
};
