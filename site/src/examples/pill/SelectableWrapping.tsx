import { FormField, FormFieldLabel, Pill, PillGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const SelectableWrapping = (): ReactElement => {
  return (
    <FormField style={{ maxWidth: "40ch" }}>
      <FormFieldLabel>Extras</FormFieldLabel>
      <PillGroup>
        <Pill value="ketchup">Ketchup</Pill>
        <Pill value="mustard">Mustard</Pill>
        <Pill value="relish">Relish</Pill>
        <Pill value="pickles">Pickles</Pill>
        <Pill value="vinegar">Vinegar</Pill>
      </PillGroup>
    </FormField>
  );
};
