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

  it("THEN the control keeps its aria-label when no label or helper text is rendered", () => {
    const markup = renderToString(
      <FormField id="test-id">
        <Input aria-label="Input label" />
      </FormField>,
    );

    // Unresolved ID references are ignored by the accessible name computation.
    // Registration removes them after mount, when the children are known.
    expect(getInput(markup)).toContain('aria-label="Input label"');
    expect(markup).not.toContain('id="label-test-id"');
    expect(markup).not.toContain('id="helperText-test-id"');
  });

  it("THEN a label and helper text inside other components are associated with the control", () => {
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
    expect(getInput(markup)).toContain('aria-labelledby="label-test-id"');
    expect(getInput(markup)).toContain('aria-describedby="helperText-test-id"');
  });

  it("THEN a label and helper text inside a layout wrapper are associated with the control", () => {
    const markup = renderToString(
      <FormField id="test-id">
        <div>
          <FormFieldLabel>Label</FormFieldLabel>
          <Input />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </div>
      </FormField>,
    );

    expect(markup).toMatch(/<label[^>]*id="label-test-id"/);
    expect(markup).toMatch(/id="helperText-test-id"[^>]*>Helper text</);
    expect(getInput(markup)).toContain('aria-labelledby="label-test-id"');
    expect(getInput(markup)).toContain('aria-describedby="helperText-test-id"');
  });
});
