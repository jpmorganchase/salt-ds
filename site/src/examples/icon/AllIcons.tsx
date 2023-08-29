import { ReactElement, useState } from "react";
import {
  FlowLayout,
  StackLayout,
  Input,
  FormField,
  FormFieldLabel,
  Text,
} from "@salt-ds/core";
import { allIcons } from "./allIconsList";

export const AllIcons = (): ReactElement => {
  const [inputText, setInputText] = useState("");

  return (
    <StackLayout style={{ padding: 10, height: "100%", width: "100%" }}>
      <FormField>
        <FormFieldLabel>Search icons</FormFieldLabel>
        <Input
          value={inputText}
          inputProps={{
            onChange: (e) => {
              setInputText(e.target.value);
            },
          }}
        />
      </FormField>
      <div style={{ overflow: "auto", maxHeight: 300 }}>
        <FlowLayout gap={3}>
          {Object.entries(allIcons)
            .filter(([name, Icon]) => new RegExp(inputText, "i").test(name))
            .map(([name, Icon]) => {
              return (
                <StackLayout
                  style={{ width: 140 }}
                  gap={1}
                  align="center"
                  key={name}
                >
                  <Icon size={2} />
                  <Text>{name}</Text>
                </StackLayout>
              );
            })}
        </FlowLayout>
      </div>
    </StackLayout>
  );
};
