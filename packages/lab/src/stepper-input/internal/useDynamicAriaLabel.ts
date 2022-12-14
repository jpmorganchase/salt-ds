import { useEffect, useState } from "react";
import { useAriaAnnouncer } from "@salt-ds/core";

// Dynamically append a string to aria-label if the component
// is controlled and the display value can be refreshed
export const useDynamicAriaLabel = (
  appendLabel: string,
  hasLiveValue: boolean,
  inputRef: React.MutableRefObject<HTMLInputElement | null>,
  value: number | string | undefined,
  valuesHaveDiverged: () => boolean
) => {
  const [hasAnnounced, setHasAnnounced] = useState(false);
  const { announce } = useAriaAnnouncer();

  useEffect(() => {
    function applyAriaMessage(ariaLabel: string) {
      // Don't append the message again if it's already part of the string
      if (!ariaLabel.includes(appendLabel)) {
        inputRef.current?.setAttribute(
          "aria-label",
          `${ariaLabel}${appendLabel}`
        );
      }

      const currentId = inputRef.current?.getAttribute("id") || "";
      const labelledBy =
        inputRef.current?.getAttribute("aria-labelledby") || "";

      if (!labelledBy.includes(currentId)) {
        inputRef.current?.setAttribute(
          "aria-labelledby",
          `${labelledBy} ${currentId}`
        );
      }
    }

    function removeAriaMessage(ariaLabel: string) {
      const replacementAria = ariaLabel?.replace(appendLabel, "");
      if (replacementAria !== undefined) {
        inputRef.current?.setAttribute("aria-label", replacementAria);
      }

      const replacementLabelledBy = inputRef.current
        ?.getAttribute("aria-labelledby")
        ?.replace(` ${inputRef.current?.getAttribute("id")}`, "");

      if (replacementLabelledBy !== undefined) {
        inputRef.current?.setAttribute(
          "aria-labelledby",
          replacementLabelledBy
        );
      }
    }

    if (hasLiveValue) {
      const ariaLabel = inputRef.current?.getAttribute("aria-label") || "";
      if (valuesHaveDiverged()) {
        applyAriaMessage(ariaLabel);
      } else {
        removeAriaMessage(ariaLabel);
      }
    }
  }, [appendLabel, inputRef, hasLiveValue, valuesHaveDiverged, value]);

  useEffect(() => {
    if (hasLiveValue && valuesHaveDiverged()) {
      // Screen readers will automatically announce updates when the dynamic `aria-label`
      // changes and the component has focus. When the component *does not* have
      // focus we should announce only once for the first value update
      if (inputRef.current !== document.activeElement && !hasAnnounced) {
        // Empty announcement required until a fix is in place for announcer
        announce("");
        announce(`${inputRef.current?.getAttribute("aria-label")}`);

        // We only want to announce on the first value change, but this flag
        // is reset when the input receives focus
        setHasAnnounced(true);
      }
    }
  }, [
    announce,
    appendLabel,
    hasAnnounced,
    inputRef,
    hasLiveValue,
    setHasAnnounced,
    valuesHaveDiverged,
    value,
  ]);

  return { setHasAnnounced };
};
