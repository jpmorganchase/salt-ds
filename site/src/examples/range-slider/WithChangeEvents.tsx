import { StackLayout, Text } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import { useState } from "react";

export const WithChangeEvents = () => {
  const [valueOnChange, setValueOnChange] = useState<[number, number]>([0, 50]);
  const [valueOnChangeEnd, setValueOnChangeEnd] = useState<[number, number]>([
    0, 50,
  ]);

  return (
    <StackLayout style={{ width: "80%" }}>
      <RangeSlider
        minLabel="0"
        maxLabel="100"
        defaultValue={[0, 50]}
        onChange={(_, value) => setValueOnChange(value)}
        onChangeEnd={(_, value) => setValueOnChangeEnd(value)}
      />
      <Text>
        Value onChange: &nbsp;
        <span style={{ color: "var(--salt-color-teal-500)" }}>
          [{valueOnChange[0]}, {valueOnChange[1]}]
        </span>
      </Text>
      <Text>
        Value onChangeEnd: &nbsp;
        <span style={{ color: "var(--salt-color-teal-500)" }}>
          [{valueOnChangeEnd[0]}, {valueOnChangeEnd[1]}]
        </span>
      </Text>
    </StackLayout>
  );
};
