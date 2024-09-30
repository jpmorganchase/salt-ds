import { type ReactNode, type SyntheticEvent, useState } from "react";
import "./ResponsiveContainer.css";
import { ToggleButton, ToggleButtonGroup, Tooltip } from "@salt-ds/core";
import { Slider, type SliderValue, StepperInput } from "@salt-ds/lab";

export const ResponsiveContainer = ({ children }: { children?: ReactNode }) => {
  const [containerWidth, setWidth] = useState([90]);
  const [containerHeight, setHeight] = useState([70]);
  const [selected, setSelected] = useState<string>("vw/vh");
  const inPixels = selected === "px";
  const maxUnits = inPixels ? 1000 : 100;
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
        <StepperInput
          value={containerWidth[0]}
          max={maxUnits}
          min={10}
          onChange={(_event, nextValue) => setWidth([nextValue as number])}
        />
        <Slider
          className="StoryContainer-slider"
          id="width"
          max={maxUnits}
          min={10}
          onChange={(value: SliderValue) => setWidth(value)}
          value={containerWidth as SliderValue}
        />
        <StepperInput
          value={containerHeight[0]}
          max={maxUnits}
          min={10}
          onChange={(_event, nextValue) => setHeight([nextValue as number])}
        />
        <Slider
          className="StoryContainer-slider"
          id="height"
          max={maxUnits}
          min={10}
          onChange={(value: SliderValue) => setHeight(value)}
          value={containerHeight as SliderValue}
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
