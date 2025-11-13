import {
  FormField,
  FormFieldLabel,
  NumberInput,
  StackLayout,
} from "@salt-ds/core";

export const FormattingSuffixPrefix = () => {
  return (
    <StackLayout style={{ width: "256px" }}>
      <FormField>
        <FormFieldLabel>With suffix</FormFieldLabel>
        <NumberInput
          defaultValue={12}
          pattern={(inputValue) =>
            inputValue === "" ||
            inputValue === "-" ||
            inputValue === "+" ||
            /^[+-]?(\d+(\.\d*)?|\.\d+)%?$/.test(inputValue)
          }
          format={(value) => `${value}%`}
          parse={(value) => {
            if (!value.length) {
              return null;
            }
            return Number.parseFloat(value.replace(/%/g, ""));
          }}
          onNumberChange={(_event, newValue) => {
            console.log(`Number changed to ${newValue}`);
          }}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>With prefix</FormFieldLabel>
        <NumberInput
          defaultValue={12}
          pattern={(inputValue) =>
            inputValue === "" ||
            inputValue === "-" ||
            inputValue === "+" ||
            /^\$?[+-]?(\d+(\.\d*)?|\.\d+)?%?$/.test(inputValue)
          }
          format={(value) => `$${value.replace(/\$/g, "")}`}
          parse={(value) => {
            if (!value.length) {
              return null;
            }
            if (value === "$") {
              return 0;
            }
            const parsedValue = value.replace(/\$/g, "");
            return Number.parseFloat(parsedValue);
          }}
          onNumberChange={(_event, newValue) => {
            console.log(`Number changed to ${newValue}`);
          }}
        />
      </FormField>
    </StackLayout>
  );
};
