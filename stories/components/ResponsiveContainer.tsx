import { FC, useState } from "react";
import "./ResponsiveContainer.css";
import {
  Slider,
  StepperInput,
  ToggleButton,
  ToggleButtonGroup,
} from "@brandname/lab";

export const ResponsiveContainer: FC = ({ children }) => {
  const [containerWidth, setWidth] = useState(90);
  const [containerHeight, setHeight] = useState(70);
  const [selectedIndex, setSelectedIndex] = useState<number>(1);
  const units = ["pixel", "viewport"];
  const inPixels = units[selectedIndex] === "pixel";
  const maxUnits = inPixels ? 1000 : 100;
  return (
    <div className="StoryContainer">
      <div className="StoryContainer-sliders">
        <ToggleButtonGroup
          className="StoryContainer-toggle"
          orientation="vertical"
          onChange={(v, i) => setSelectedIndex(i)}
          selectedIndex={selectedIndex}
        >
          <ToggleButton tooltipText="Pixels">px</ToggleButton>
          <ToggleButton tooltipText="Viewport units">vw/vh</ToggleButton>
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
