import { ReactElement, SyntheticEvent, useCallback, useState } from "react";
import {
  StackLayout,
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
} from "@salt-ds/core";
import { ComboBoxNext, DropdownNext } from "@salt-ds/lab";

interface AddressFormData {
  [country: string]: ReactElement;
}

export const DynamicFormat = (): ReactElement => {
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  const handleSelect = (_event: SyntheticEvent, data: { value: string }) => {
    setSelectedCountry(data.value);
  };

  const States = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
  ];

  const addressForms: AddressFormData = {
    France: (
      <>
        <FormField>
          <FormFieldLabel>Nom complet/Raison sociale</FormFieldLabel>
          <Input defaultValue="Sylvie Fortnite" />
        </FormField>
        <FormField>
          <FormFieldLabel>Adresse 1</FormFieldLabel>
          <Input defaultValue="1 Rue de la Légion d'Honneur" />
          <FormFieldHelperText>Numérotation des rues</FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Adresse 2 (facultatif)</FormFieldLabel>
          <Input />
          <FormFieldHelperText>Appt, Suite, Unité etc.</FormFieldHelperText>
        </FormField>
        <StackLayout gap={2} direction={"row"} role="group">
          <FormField style={{ width: "40%" }}>
            <FormFieldLabel>Code postal</FormFieldLabel>
            <Input defaultValue="75007" />
          </FormField>
          <FormField style={{ width: "60%" }}>
            <FormFieldLabel>Ville</FormFieldLabel>
            <Input defaultValue="Paris" />
          </FormField>
        </StackLayout>
      </>
    ),
    // Add these sections to your existing code within the addressForms object
    Germany: (
      <>
        <FormField>
          <FormFieldLabel>Name/Firmennamen</FormFieldLabel>
          <Input defaultValue="Albrecht Dürer" />
        </FormField>
        <FormField>
          <FormFieldLabel>Anschrift zeile 1</FormFieldLabel>
          <Input defaultValue="Nonnendammallee 25" />
          <FormFieldHelperText>
            Straßenname und -nummer, Abholort
          </FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Anschrift zeile 2 (optional)</FormFieldLabel>
          <Input />
          <FormFieldHelperText>
            PO Box, c/o, Pakadoo PAK-ID usw.
          </FormFieldHelperText>
        </FormField>
        <StackLayout gap={2} direction={"row"} role="group">
          <FormField style={{ width: "40%" }}>
            <FormFieldLabel>PLZ</FormFieldLabel>
            <Input defaultValue="13599" />
          </FormField>
          <FormField style={{ width: "60%" }}>
            <FormFieldLabel>Stadt</FormFieldLabel>
            <Input defaultValue="Berlin" />
          </FormField>
        </StackLayout>
      </>
    ),

    Spain: (
      <>
        <FormField>
          <FormFieldLabel>Nombre completo/Razón social</FormFieldLabel>
          <Input defaultValue="José Pizarro" />
        </FormField>
        <FormField>
          <FormFieldLabel>Dirección 1</FormFieldLabel>
          <Input defaultValue="Av. de Sant Julià, 148" />
          <FormFieldHelperText>nombre de la calle</FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Dirección 2 (opcional)</FormFieldLabel>
          <Input placeholder="P.I. Congost, Apartamento, suite, unidad, edificio, piso, etc." />
        </FormField>
        <StackLayout gap={2} direction={"row"} role="group">
          <FormField style={{ width: "40%" }}>
            <FormFieldLabel>Código postal</FormFieldLabel>
            <Input defaultValue="08400" />
          </FormField>
          <FormField style={{ width: "60%" }}>
            <FormFieldLabel>Ciudad</FormFieldLabel>
            <Input defaultValue="Barcelona" />
          </FormField>
        </StackLayout>
        <FormField>
          <FormFieldLabel>Provincia/Estado (opcional)</FormFieldLabel>
          <Input defaultValue="Barcelona" />
        </FormField>
      </>
    ),

    "United Kingdom": (
      <>
        <FormField>
          <FormFieldLabel>Full name/Company name</FormFieldLabel>
          <Input defaultValue="JP Morgan" />
        </FormField>
        <FormField>
          <FormFieldLabel>Address 1</FormFieldLabel>
          <Input defaultValue="25 Bank Street" />
        </FormField>
        <FormField>
          <FormFieldLabel>Address 2 (optional)</FormFieldLabel>
          <Input placeholder="PO Box, c/o, Pakadoo PAK-ID etc." />
        </FormField>
        <StackLayout gap={2} direction={"row"} role="group">
          <FormField style={{ width: "40%" }}>
            <FormFieldLabel>Postcode</FormFieldLabel>
            <Input defaultValue="E14 5JP" />
          </FormField>
          <FormField style={{ width: "60%" }}>
            <FormFieldLabel>Town/City</FormFieldLabel>
            <Input defaultValue="London" />
          </FormField>
        </StackLayout>
      </>
    ),

    "United States": (
      <>
        <FormField>
          <FormFieldLabel>Full name/Company name</FormFieldLabel>
          <Input />
        </FormField>
        <FormField>
          <FormFieldLabel>Address 1</FormFieldLabel>
          <Input />
          <FormFieldHelperText>Street address or P.O. box</FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Address 2 (optional)</FormFieldLabel>
          <Input />
          <FormFieldHelperText>
            Apt, Suite, Unit, Building etc
          </FormFieldHelperText>
        </FormField>
        <StackLayout gap={2} direction={"row"} role="group">
          <FormField style={{ width: "40%" }}>
            <FormFieldLabel>ZIP code</FormFieldLabel>
            <Input />
          </FormField>
          <FormField style={{ width: "60%" }}>
            <FormFieldLabel>City</FormFieldLabel>
            <Input />
          </FormField>
        </StackLayout>
        <FormField>
          <FormFieldLabel>State</FormFieldLabel>
          <ComboBoxNext source={States} style={{ width: "100%" }} />
        </FormField>
      </>
    ),
  };

  const Countries = Object.keys(addressForms);

  return (
    <>
      <StackLayout style={{ width: 356 }}>
        <FormField>
          <FormFieldLabel>Country</FormFieldLabel>
          <DropdownNext
            source={Countries}
            style={{ width: "100%" }}
            onSelect={handleSelect}
          />
          {selectedCountry && addressForms[selectedCountry]}
        </FormField>
      </StackLayout>
    </>
  );
};
