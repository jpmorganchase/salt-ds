import { Slider, StackLayout, Text } from "@salt-ds/core";
import { useState } from "react";

export const WithChangeEvents = () => {
  const [valueOnChange, setValueOnChange] = useState<number>(50);
  const [valueOnChangeEnd, setValueOnChangeEnd] = useState<number>(50);

  return (
    <StackLayout style={{ width: "80%" }}>
      <Slider
        minLabel="0"
        maxLabel="100"
        defaultValue={50}
        onChange={(_, value) => setValueOnChange(value)}
        onChangeEnd={(_, value) => setValueOnChangeEnd(value)}
      />
      <Text>
        Value onChange: &nbsp;
        <Text as="span" fontWeight="bolder">
          {valueOnChange}
        </Text>
      </Text>
      <Text>
        Value onChangeEnd: &nbsp;
        <Text as="span" fontWeight="bolder">
          {valueOnChangeEnd}
        </Text>
      </Text>
    </StackLayout>
  );
};
