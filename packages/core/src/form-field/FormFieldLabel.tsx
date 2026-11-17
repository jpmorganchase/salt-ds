import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type MouseEvent, useEffect, useRef } from "react";

import { useFormFieldProps } from "../form-field-context";
import { Label, type TextProps } from "../text";
import { capitalize, makePrefixer } from "../utils";

import formFieldLabelCss from "./FormFieldLabel.css";

const withBaseName = makePrefixer("saltFormFieldLabel");

/**
 * Returns the controls whose `aria-label` is ignored, because their
 * `aria-labelledby` refers to the FormFieldLabel, which then provides the name.
 */
function getControlsWithIgnoredAriaLabel(
  formField: HTMLElement,
  labelId: string,
  root: Document | ShadowRoot,
) {
  // Match ids in JS rather than in the selector, so ids needing CSS escaping can't throw.
  return Array.from(
    formField.querySelectorAll("[aria-label][aria-labelledby]"),
  ).filter((control) => {
    const ariaLabel = control.getAttribute("aria-label")?.trim();
    const labelledByIds = (control.getAttribute("aria-labelledby") ?? "")
      .split(/\s+/)
      .filter(Boolean);
    // The aria-label isn't lost when the control refers to itself, or to an
    // element with the same text. Generated fallback labels deliberately
    // yield to a FormFieldLabel.
    return (
      Boolean(ariaLabel) &&
      labelledByIds.includes(labelId) &&
      !labelledByIds.includes(control.id) &&
      !labelledByIds.some(
        (id) => root.getElementById(id)?.textContent?.trim() === ariaLabel,
      ) &&
      !control.hasAttribute("data-salt-aria-label-fallback")
    );
  });
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
  const { a11yProps, disabled, necessity, formFieldRef } = useFormFieldProps();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-form-field-label",
    css: formFieldLabelCss,
    window: targetWindow,
  });

  const id = a11yProps?.["aria-labelledby"];

  // Created on first use, so production builds don't allocate it.
  const warnedRef = useRef<WeakSet<Element> | null>(null);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      let cancelled = false;
      // Inspect the DOM after any label references set in layout effects settle.
      queueMicrotask(() => {
        const formField = formFieldRef?.current;
        if (cancelled || !formField || !id) {
          return;
        }
        // ID references resolve within the document or shadow root.
        const rootNode = formField.getRootNode() as Document | ShadowRoot;
        const root =
          typeof rootNode.getElementById === "function"
            ? rootNode
            : formField.ownerDocument;
        const label = root.getElementById(id);
        if (!label) {
          return;
        }

        if (!warnedRef.current) {
          warnedRef.current = new WeakSet();
        }
        const warned = warnedRef.current;
        // Group by text, so a control that puts one aria-label on several elements warns once.
        const controlsByAriaLabel = new Map<string, Element[]>();
        for (const control of getControlsWithIgnoredAriaLabel(
          formField,
          id,
          root,
        )) {
          if (warned.has(control)) {
            continue;
          }
          warned.add(control);
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
      });
      return () => {
        cancelled = true;
      };
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
