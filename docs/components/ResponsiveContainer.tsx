import { useState, ReactNode, SyntheticEvent } from "react";
import "./ResponsiveContainer.css";
import {
  Slider,
  StepperInput,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/lab";
import { Tooltip } from "@salt-ds/core";

export const ResponsiveContainer = ({ children }: { children?: ReactNode }) => {
  const [containerWidth, setWidth] = useState(90);
  const [containerHeight, setHeight] = useState(70);
  const [selected, setSelected] = useState<string>("vw/vh");
  const inPixels = selected === "px";
  const maxUnits = inPixels ? 1000 : 100;
  return (
    <div className="StoryContainer">
      <div className="StoryContainer-sliders">
        <ToggleButtonGroup
          className="StoryContainer-toggle"
          orientation="vertical"
          onSelectionChange={(event: SyntheticEvent<HTMLButtonElement>) =>
            setSelected(event.currentTarget.value)
          }
          selected={selected}
        >
          <Tooltip content="Pixels">
            <ToggleButton value="px">px</ToggleButton>
          </Tooltip>
          <Tooltip content="Viewport units">
            <ToggleButton value="vw/vh">vw/vh</ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
        <StepperInput
          value={containerWidth}
          max={maxUnits}
          min={10}
          onChange={(nextValue) => setWidth(nextValue as number)}
        />
        <Slider
          className="StoryContainer-slider"
          id="width"
          label="Container Width"
          max={maxUnits}
          min={10}
          onChange={(nextValue) => setWidth(nextValue as number)}
          value={containerWidth}
        />
        <StepperInput
          value={containerHeight}
          max={maxUnits}
          min={10}
          onChange={(nextValue) => setHeight(nextValue as number)}
        />
        <Slider
          className="StoryContainer-slider"
          id="height"
          label="Container Height"
          max={maxUnits}
          min={10}
          onChange={(nextValue) => setHeight(nextValue as number)}
          value={containerHeight}
        />
      </div>

      <div
        className="StoryContainer-wrapper"
        style={{
          width: `${containerWidth}${inPixels ? "px" : "vw"}`,
          height: `${containerHeight}${inPixels ? "px" : "vh"}`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
