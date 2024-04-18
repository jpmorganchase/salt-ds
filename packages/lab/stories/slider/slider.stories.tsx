import { Input, useId } from "@salt-ds/core";
import { Slider, SliderProps } from "@salt-ds/lab";
import { useState, FormEvent } from "react";
import { StoryFn } from "@storybook/react";

export default {
  title: "Lab/Slider",
  component: Slider,
};

const Default: StoryFn<SliderProps> = ({ ...args }) => {
  const id = useId();

  return <Slider style={{ width: "300px" }} {...args}></Slider>;
};

export const SingleInput = Default.bind({});
SingleInput.args = {
  min: 0,
  max: 100,
};

export const WithInput = () => {
  const [value, setValue] = useState<number>(0);
  const max = 50;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Input
        style={{ width: "1px", margin: "5px" }}
        onChange={(event: FormEvent<HTMLInputElement>) =>
          setValue(event.target.value)
        }
      >
        {value}
      </Input>
      <Slider
        style={{ width: "300px" }}
        min={0}
        max={max}
        value={value}
      ></Slider>
    </div>
  );
};
