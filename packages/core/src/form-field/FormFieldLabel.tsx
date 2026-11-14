import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { computeAccessibleName, isInaccessible } from "dom-accessibility-api";
import { type MouseEvent, useEffect, useRef } from "react";

import { useFormFieldProps } from "../form-field-context";
import { Label, type TextProps } from "../text";
import { capitalize, makePrefixer } from "../utils";

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
    // Generated fallback labels deliberately yield to a FormFieldLabel.
    if (
      !ariaLabel ||
      !labelledByIds.includes(labelId) ||
      labelledByIds.includes(control.id) ||
      control.hasAttribute("data-salt-aria-label-fallback") ||
      isInaccessible(control)
    ) {
      return false;
    }

    // Text alternatives such as aria-label and image alt, and hidden content,
    // can make the accessible name different from the label's textContent.
    const name = computeAccessibleName(control);
    return !containsWords(name, ariaLabel);
  });
}

// Scripts usually written without spaces between words.
const unspacedScript =
  "\\p{scx=Han}\\p{scx=Hiragana}\\p{scx=Katakana}\\p{scx=Thai}\\p{scx=Lao}\\p{scx=Khmer}\\p{scx=Myanmar}";

/**
 * Whether `text` contains `phrase` as whole words, ignoring case and whitespace
 * differences, so "date" is found in "Trade date" but not in "Update frequency".
 * Words in scripts written without spaces, such as Chinese, Japanese or Thai,
 * can't be told apart, so "日付" is found in "開始日付".
 */
function containsWords(text: string, phrase: string) {
  const trimmedPhrase = phrase.trim();
  const escapedPhrase = trimmedPhrase
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s+");
  // A character that isn't part of a word (a letter, combining mark or
  // number), or is in an unspaced script.
  const boundary = `[^\\p{L}\\p{M}\\p{N}]|[${unspacedScript}]`;
  // Use a prefix rather than lookbehind, which Safari < 16.4 doesn't support.
  const before = new RegExp(`^[${unspacedScript}]`, "u").test(trimmedPhrase)
    ? ""
    : `(?:^|${boundary})`;
  const after = new RegExp(`[${unspacedScript}]$`, "u").test(trimmedPhrase)
    ? ""
    : `(?=$|${boundary})`;
  return new RegExp(`${before}${escapedPhrase}${after}`, "iu").test(text);
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

  const warnedRef = useRef(new WeakSet<Element>());
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      let cancelled = false;
      // Some controls settle their label references in a layout effect. Inspect
      // the committed result after those updates, without observing later DOM mutations.
      queueMicrotask(() => {
        if (cancelled) {
          return;
        }
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
