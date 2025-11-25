import { Pill, PillGroup, StackLayout, Text } from "@salt-ds/core";
import { type ReactElement, useId } from "react";

export const SelectableWrapping = (): ReactElement => {
  const groupLabelId = useId();
  return (
    <StackLayout style={{ maxWidth: "40ch" }}>
      <Text styleAs="h3" id={`${groupLabelId}-title`}>
        Extras
      </Text>
      <PillGroup aria-labelledby={`${groupLabelId}-title`}>
        <Pill value="ketchup">Ketchup</Pill>
        <Pill value="mustard">Mustard</Pill>
        <Pill value="relish">Relish</Pill>
        <Pill value="pickles">Pickles</Pill>
        <Pill value="vinegar">Vinegar</Pill>
      </PillGroup>
    </StackLayout>
  );
};
