import {
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import type { Decorator } from "@storybook/react-vite";
import { type ReactNode, type SyntheticEvent, useState } from "react";
import "./ResponsiveContainer.css";

const ResponsiveContainer = ({ children }: { children?: ReactNode }) => {
  const [containerWidth, setWidth] = useState([90]);
  const [containerHeight, setHeight] = useState([70]);
  const [selected, setSelected] = useState<string>("vw/vh");
  const inPixels = selected === "px";
  const maxUnits = inPixels ? 1000 : 100;
  const toFloat = (value: string | number) =>
    typeof value === "string" ? Number.parseFloat(value) : value;

  return (
    <div className="StoryContainer">
      <div className="StoryContainer-sliders">
        <ToggleButtonGroup
          className="StoryContainer-toggle"
          orientation="vertical"
          onChange={(event: SyntheticEvent<HTMLButtonElement>) =>
            setSelected(event.currentTarget.value)
          }
          value={selected}
        >
          <Tooltip content="Pixels">
            <ToggleButton value="px">px</ToggleButton>
          </Tooltip>
          <Tooltip content="Viewport units">
            <ToggleButton value="vw/vh">vw/vh</ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
        <NumberInput
          value={containerWidth[0]}
          max={maxUnits}
          min={10}
          onChange={(_event, nextValue) => setWidth([nextValue as number])}
        />
        <Slider
          className="StoryContainer-slider"
          max={maxUnits}
          min={10}
          onChange={(_event, value) => setWidth([toFloat(value)])}
          value={containerWidth[0]}
        />
        <NumberInput
          value={containerHeight[0]}
          max={maxUnits}
          min={10}
          onChange={(_event, nextValue) => setHeight([nextValue as number])}
        />
        <Slider
          className="StoryContainer-slider"
          max={maxUnits}
          min={10}
          onChange={(_event, value) => setHeight([toFloat(value)])}
          value={containerHeight[0]}
        />
      </div>

      <div
        className="StoryContainer-wrapper"
        style={{
          width: `${containerWidth[0]}${inPixels ? "px" : "vw"}`,
          height: `${containerHeight[0]}${inPixels ? "px" : "vh"}`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const withResponsiveWrapper: Decorator = (Story, context) => {
  const { responsive } = context.globals;

  return responsive === "wrap" ? (
    <ResponsiveContainer>
      <Story {...context} />
    </ResponsiveContainer>
  ) : (
    <Story {...context} />
  );
};
