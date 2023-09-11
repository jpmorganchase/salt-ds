import { ReactElement, useCallback, useState } from "react";
import {
  StackLayout,
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
} from "@salt-ds/core";
import { ComboBoxNext, DropdownNext } from "@salt-ds/lab";

export const DynamicFormat = (): ReactElement => {
  const [selectedCountry, setSelectedCountry] = useState<String>("");
  console.log("selected country", selectedCountry);


  const States = [
    "Alabama",
    "Alaska",
    "American Samoa",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "District of Columbia",
    "Federated States of Micronesia",
    "Florida",
    "Georgia",
    "Guam",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Marshall Islands",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Northern Mariana Islands",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Palau",
    "Pennsylvania",
    "Puerto Rico",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virgin Island",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  const FranceForm = (
    <>
      <div>France</div>
    </>
  );

  const GermanyForm = (
    <>
      <div>France</div>
    </>
  );

  const UnitedStatesForm = (
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
  );

  const Countries = ["France", "Germany", "United States"];

  return (
    <>
      <StackLayout>
        <FormField>
          <FormFieldLabel>Country</FormFieldLabel>
          <DropdownNext

            source={Countries}
            style={{ width: "100%" }}
            ListProps={onChange}
         
          // TODO set the selectedCountry when selected in the dropdown
          />
          {selectedCountry == "United States" && UnitedStatesForm}
          {selectedCountry == "France" && FranceForm}
          {selectedCountry == "Germany" && GermanyForm}
        </FormField>
        {}
      </StackLayout>
    </>
  );
};
