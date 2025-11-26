import { FormField, FormFieldLabel, Pill, PillGroup } from "@salt-ds/core";
import { type ReactElement, useId } from "react";

export const SelectableWrapping = (): ReactElement => {
  const groupLabelId = useId();
  return (
    <FormField style={{ maxWidth: "40ch" }}>
      <FormFieldLabel>Extras</FormFieldLabel>
      <PillGroup aria-labelledby={`${groupLabelId}-title`}>
        <Pill value="ketchup">Ketchup</Pill>
        <Pill value="mustard">Mustard</Pill>
        <Pill value="relish">Relish</Pill>
        <Pill value="pickles">Pickles</Pill>
        <Pill value="vinegar">Vinegar</Pill>
      </PillGroup>
    </FormField>
  );
};
