import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type MouseEvent, useEffect, useRef } from "react";

import { useFormFieldProps } from "../form-field-context";
import { Label, type TextProps } from "../text";
import { capitalize, makePrefixer, useIsomorphicLayoutEffect } from "../utils";

import formFieldLabelCss from "./FormFieldLabel.css";

const withBaseName = makePrefixer("saltFormFieldLabel");

/**
 * Returns the controls labelled by `labelId` whose `aria-label` is dropped from
 * the accessible name, because `aria-labelledby` takes precedence.
 */
function getControlsWithIgnoredAriaLabel(
  formField: HTMLElement,
  labelId: string,
) {
  // Match ids in JS rather than in the selector, so ids needing CSS escaping can't throw.
  return Array.from(
    formField.querySelectorAll("[aria-label][aria-labelledby]"),
  ).filter((control) => {
    const ariaLabel = control.getAttribute("aria-label")?.trim();
    const labelledByIds = (control.getAttribute("aria-labelledby") ?? "")
      .split(/\s+/)
      .filter(Boolean);
    // A control that references itself keeps its aria-label in the name.
    if (
      !ariaLabel ||
      !labelledByIds.includes(labelId) ||
      labelledByIds.includes(control.id)
    ) {
      return false;
    }

    const name = labelledByIds
      .map((id) => control.ownerDocument.getElementById(id)?.textContent ?? "")
      .join(" ");
    return !containsWords(name, ariaLabel);
  });
}

/**
 * Whether `text` contains `phrase` as whole words, ignoring case and whitespace
 * differences, so "date" is found in "Trade date" but not in "Update frequency".
 */
function containsWords(text: string, phrase: string) {
  const escapedPhrase = phrase
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s+");
  return new RegExp(
    `(?<![\\p{L}\\p{N}])${escapedPhrase}(?![\\p{L}\\p{N}])`,
    "iu",
  ).test(text);
}

export interface FormFieldLabelProps
  extends Omit<TextProps<"label">, "variant" | "styleAs" | "fontWeight"> {
  /**
   * Intent for the label.
   *
   * Defaults to "label"
   * Using "sentence" gives more prominent styling
   */
  intent?: "label" | "sentence";
}

export const FormFieldLabel = ({
  className,
  children,
  intent = "label",
  onClick,
  ...restProps
}: FormFieldLabelProps) => {
  const { a11yProps, disabled, necessity, formFieldRef, registerLabel } =
    useFormFieldProps();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-form-field-label",
    css: formFieldLabelCss,
    window: targetWindow,
  });

  const id = a11yProps?.["aria-labelledby"];

  useIsomorphicLayoutEffect(() => registerLabel?.(), [registerLabel]);

  const warnedRef = useRef(new WeakSet<Element>());
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      const formField = formFieldRef?.current;
      const label = id ? formField?.ownerDocument.getElementById(id) : null;
      if (!formField || !id || !label) {
        return;
      }

      // Group by text, so a control that puts one aria-label on several elements warns once.
      const controlsByAriaLabel = new Map<string, Element[]>();
      for (const control of getControlsWithIgnoredAriaLabel(formField, id)) {
        if (warnedRef.current.has(control)) {
          continue;
        }
        warnedRef.current.add(control);
        const ariaLabel = control.getAttribute("aria-label")?.trim() ?? "";
        controlsByAriaLabel.set(ariaLabel, [
          ...(controlsByAriaLabel.get(ariaLabel) ?? []),
          control,
        ]);
      }
      for (const [ariaLabel, controls] of controlsByAriaLabel) {
        console.warn(
          `Salt: aria-label "${ariaLabel}" is ignored because FormFieldLabel "${label.textContent?.trim()}" provides the accessible name. Use aria-labelledby to add to the name, or aria-describedby to add a description.`,
          ...controls,
        );
      }
    }
  });

  const handleClick = (event: MouseEvent<HTMLLabelElement>) => {
    if (formFieldRef?.current) {
      const element = formFieldRef.current.querySelector<HTMLElement>(
        `[aria-labelledby*="${id}"]`,
      );
      element?.focus();
      element?.click();
    }
    onClick?.(event);
  };

  const necessityLabel = necessity
    ? necessity === "asterisk"
      ? " *"
      : ` (${capitalize(necessity)})`
    : undefined;

  return (
    <Label
      className={clsx(withBaseName(), withBaseName(intent), className)}
      id={id}
      disabled={disabled}
      color={intent === "sentence" ? "primary" : "secondary"}
      onClick={handleClick}
      {...restProps}
    >
      {children}
      {necessityLabel && (
        <span className={withBaseName("necessityLabel")}>{necessityLabel}</span>
      )}
    </Label>
  );
};
