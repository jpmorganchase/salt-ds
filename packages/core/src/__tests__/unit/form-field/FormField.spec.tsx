import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
} from "@salt-ds/core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

function getInput(markup: string) {
  return markup.match(/<input[^>]*>/)?.[0];
}

describe("GIVEN a FormField rendered on the server", () => {
  it("THEN the control refers to its label and helper text", () => {
    const markup = renderToString(
      <FormField id="test-id">
        <FormFieldLabel>Label</FormFieldLabel>
        <Input />
        <FormFieldHelperText>Helper text</FormFieldHelperText>
      </FormField>,
    );

    expect(markup).toMatch(/<label[^>]*id="label-test-id"/);
    expect(markup).toMatch(/id="helperText-test-id"[^>]*>Helper text</);
    expect(getInput(markup)).toContain('aria-labelledby="label-test-id"');
    expect(getInput(markup)).toContain('aria-describedby="helperText-test-id"');
  });

  it("THEN the control doesn't refer to a label or helper text that isn't rendered", () => {
    const markup = renderToString(
      <FormField id="test-id">
        <Input aria-label="Input label" />
      </FormField>,
    );

    expect(getInput(markup)).not.toContain("aria-labelledby");
    expect(getInput(markup)).not.toContain("aria-describedby");
  });

  it("THEN a label and helper text inside other components have their ids", () => {
    function Content() {
      return (
        <>
          <FormFieldLabel>Label</FormFieldLabel>
          <Input />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </>
      );
    }

    const markup = renderToString(
      <FormField id="test-id">
        <Content />
      </FormField>,
    );

    expect(markup).toMatch(/<label[^>]*id="label-test-id"/);
    expect(markup).toMatch(/id="helperText-test-id"[^>]*>Helper text</);
  });
});
