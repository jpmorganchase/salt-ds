import type { Chart } from "highcharts";

// Highcharts doesn't expose renderer-button internals so we take these properties in that we need
// box - svg element that Highcharts passes to setFocusElement when reset button receives keyboard focus
// element - if present, indicates button still exists in DOM tree
// setState - the internal Highcharts API for switching visual state (0 is default, 1 is hover)
type ResetZoomButton = {
  box?: unknown;
  element?: unknown;
  setState?: (state?: number) => void;
};

type ChartWithFocusElement = Chart & {
  resetZoomButton?: ResetZoomButton;
  setFocusToElement?: (svgElement: unknown, focusElement?: unknown) => unknown;
};

type ChartWithSetFocusToElement = ChartWithFocusElement & {
  setFocusToElement: NonNullable<ChartWithFocusElement["setFocusToElement"]>;
};

// ensures we don't double wrap after every render and weakset avoids having to manually clean up of charts
const enhancedCharts = new WeakSet<ChartWithFocusElement>();

// weakset so we don't duplicate listeners if setFocusToElement runs again for the same proxy
// the a11y proxy button (focusElement) gets one blur listener so we can reset the svg button when keyboard focus leaves
const focusElementsWithBlurReset = new WeakSet<EventTarget>();

// type guarding - focusElement isn't documenented in Highcharts so is unknown (but we want to check its an EventTarget before adding a listener)
const canListenForBlur = (value: unknown): value is EventTarget =>
  typeof (value as EventTarget | undefined)?.addEventListener === "function";

// type guarding - Highcharts only installs setFocusToElement when the accessibility module is loaded
const hasSetFocusToElement = (
  chart: Chart | undefined,
): chart is ChartWithSetFocusToElement => {
  if (!chart) {
    return false;
  }

  return (
    typeof (chart as ChartWithFocusElement).setFocusToElement === "function"
  );
};

// ensures we only call setState on blur if the button still exists - reset button is destroyed when
// zoom is cleared or chart redraws and blur could fire after that so this guards against a stale ref
const resetZoomButtonState = (
  resetButton: ResetZoomButton | undefined,
  state: number,
) => {
  if (resetButton?.element) {
    resetButton.setState?.(state);
  }
};

export const enhanceResetZoomFocus = (chart: Chart | undefined) => {
  if (!hasSetFocusToElement(chart) || enhancedCharts.has(chart)) {
    return;
  }

  const setFocusToElement = chart.setFocusToElement;

  //  replace setFocusToElement on this chart instance only (not Chart.prototype) which preserves the original in closure as setFocusToElement
  chart.setFocusToElement = function (
    this: ChartWithFocusElement,
    svgElement,
    focusElement,
  ) {
    // call Highcharts first — it draws/updates .highcharts-focus-border and moves keyboard focus to the proxy
    const result = setFocusToElement.call(this, svgElement, focusElement);
    const resetButton = this.resetZoomButton;

    if (resetButton && svgElement === resetButton.box) {
      // on focus, we want the button to have the 'hover' styles (to which we add the outline) so we reuse the styles
      // we defined in the Options (.resetButton.thene.states.hover)
      resetButton.setState?.(1);

      if (
        canListenForBlur(focusElement) &&
        !focusElementsWithBlurReset.has(focusElement)
      ) {
        focusElementsWithBlurReset.add(focusElement);

        focusElement.addEventListener("blur", () => {
          // when the proxy button is blired, return the svg button to 'default' state (0)
          resetZoomButtonState(this.resetZoomButton, 0);
        });
      }
    }

    return result;
  };
  enhancedCharts.add(chart);
};
