import { RangeSlider, StackLayout, Text } from "@salt-ds/core";
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
        <Text as="span" fontWeight="bolder">
          [{valueOnChange[0]}, {valueOnChange[1]}]
        </Text>
      </Text>
      <Text>
        Value onChangeEnd: &nbsp;
        <Text as="span" fontWeight="bolder">
          [{valueOnChangeEnd[0]}, {valueOnChangeEnd[1]}]
        </Text>
      </Text>
    </StackLayout>
  );
};
