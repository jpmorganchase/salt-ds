import { Button, Card, Checkbox, Label, Input } from "@salt-ds/core";
import {
  Slider,
  SliderProps,
  SliderSelection,
  SliderTrack,
} from "@salt-ds/lab";
import { useState } from "react";
import { StoryFn } from "@storybook/react";

export default {
  title: "Lab/Slider",
  component: Slider,
};

export const Simple = () => {
  const [value, setValue] = useState(0);
  return (
    <>
      {/* <Input onChange={(event) => setValue(event.target.value)}></Input> */}
      <Slider style={{ width: "300px" }}></Slider>
    </>
  );
};

export const Range = () => {
  return (
    <>
      <Slider style={{ width: "500px" }} defaultValue={[0, 10]}></Slider>
    </>
  );
};
