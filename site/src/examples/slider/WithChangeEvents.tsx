import { StackLayout, Text } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
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
        <span style={{ color: "var(--salt-color-teal-500)" }}>
          {valueOnChange}
        </span>
      </Text>
      <Text>
        Value onChangeEnd: &nbsp;
        <span style={{ color: "var(--salt-color-teal-500)" }}>
          {valueOnChangeEnd}
        </span>
      </Text>
    </StackLayout>
  );
};
