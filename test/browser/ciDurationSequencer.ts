import path from "node:path";
import { BaseSequencer, type TestSpecification } from "vitest/node";

// Experimental CI scheduler. Per-file seconds are the average across React
// 16, 17, 18 and 19 in the successful 2026-11-16 two-shard run:
// https://github.com/jpmorganchase/salt-ds/actions/runs/43842864108
//
// These estimates affect scheduling only: no test files are filtered or skipped.
// New files receive a fallback cost and remain included in exactly one shard.
const estimatedSecondsByFile: Record<string, number> = {
  "packages/core/src/__tests__/__e2e__/accordion/accordion.browser.test.tsx": 1.63,
  "packages/core/src/__tests__/__e2e__/aria-announcer/aria-announcer.browser.test.tsx": 0.9,
  "packages/core/src/__tests__/__e2e__/avatar/avatar.browser.test.tsx": 1.09,
  "packages/core/src/__tests__/__e2e__/badge/badge.browser.test.tsx": 0.19,
  "packages/core/src/__tests__/__e2e__/banner/banner.browser.test.tsx": 1.17,
  "packages/core/src/__tests__/__e2e__/border-layout/border-layout.browser.test.tsx": 0.56,
  "packages/core/src/__tests__/__e2e__/breadcrumbs/breadcrumbs.browser.test.tsx": 2.58,
  "packages/core/src/__tests__/__e2e__/breakpoint-provider/breakpoint-provider.browser.test.tsx": 0.55,
  "packages/core/src/__tests__/__e2e__/button/button.browser.test.tsx": 1.89,
  "packages/core/src/__tests__/__e2e__/card/card.browser.test.tsx": 1.55,
  "packages/core/src/__tests__/__e2e__/checkbox/checkbox-group.browser.test.tsx": 1.65,
  "packages/core/src/__tests__/__e2e__/checkbox/checkbox.browser.test.tsx": 1.36,
  "packages/core/src/__tests__/__e2e__/collapsible/collapsible.browser.test.tsx": 1.21,
  "packages/core/src/__tests__/__e2e__/combo-box/combo-box.browser.test.tsx": 14.89,
  "packages/core/src/__tests__/__e2e__/dialog/dialog.browser.test.tsx": 5.15,
  "packages/core/src/__tests__/__e2e__/divider/divider.browser.test.tsx": 0.2,
  "packages/core/src/__tests__/__e2e__/drawer/drawer-resize.browser.test.tsx": 15.62,
  "packages/core/src/__tests__/__e2e__/drawer/drawer.browser.test.tsx": 10.76,
  "packages/core/src/__tests__/__e2e__/dropdown/dropdown-core.browser.test.tsx": 8.63,
  "packages/core/src/__tests__/__e2e__/file-drop-zone/file-drop-zone.browser.test.tsx": 1.35,
  "packages/core/src/__tests__/__e2e__/flex-item/flex-item.browser.test.tsx": 0.12,
  "packages/core/src/__tests__/__e2e__/flex-layout/flex-layout.browser.test.tsx": 1.26,
  "packages/core/src/__tests__/__e2e__/floating-platform/floating-platform.browser.test.tsx": 0.68,
  "packages/core/src/__tests__/__e2e__/flow-layout/flow-layout.browser.test.tsx": 0.21,
  "packages/core/src/__tests__/__e2e__/form-field/form-field.browser.test.tsx": 3.46,
  "packages/core/src/__tests__/__e2e__/grid-layout/grid-layout.browser.test.tsx": 1.45,
  "packages/core/src/__tests__/__e2e__/input/input.browser.test.tsx": 0.86,
  "packages/core/src/__tests__/__e2e__/interactable-card/interactable-card-disabled-selection.browser.test.tsx": 0.88,
  "packages/core/src/__tests__/__e2e__/interactable-card/interactable-card.browser.test.tsx": 4.19,
  "packages/core/src/__tests__/__e2e__/kbd/kbd.browser.test.tsx": 0.12,
  "packages/core/src/__tests__/__e2e__/link-button/link-button.browser.test.tsx": 0.2,
  "packages/core/src/__tests__/__e2e__/link-card/link-card.browser.test.tsx": 0.53,
  "packages/core/src/__tests__/__e2e__/link/link.browser.test.tsx": 0.2,
  "packages/core/src/__tests__/__e2e__/list-box/list-box.browser.test.tsx": 1.43,
  "packages/core/src/__tests__/__e2e__/list-control/list-control-option-subscriptions.browser.test.tsx": 1.56,
  "packages/core/src/__tests__/__e2e__/list-control/list-control-registry.browser.test.tsx": 1.17,
  "packages/core/src/__tests__/__e2e__/mega-menu/mega-menu-accessibility.browser.test.tsx": 1.9,
  "packages/core/src/__tests__/__e2e__/mega-menu/mega-menu-keyboard-navigation.browser.test.tsx": 5.11,
  "packages/core/src/__tests__/__e2e__/mega-menu/mega-menu.browser.test.tsx": 1.88,
  "packages/core/src/__tests__/__e2e__/menu/menu.browser.test.tsx": 7.07,
  "packages/core/src/__tests__/__e2e__/multiline-input/multiline-input.browser.test.tsx": 1.32,
  "packages/core/src/__tests__/__e2e__/navigation-item/navigation-item.browser.test.tsx": 0.54,
  "packages/core/src/__tests__/__e2e__/number-input/number-input-accessibility.browser.test.tsx": 1.64,
  "packages/core/src/__tests__/__e2e__/number-input/number-input.browser.test.tsx": 7.79,
  "packages/core/src/__tests__/__e2e__/on-solid-button/on-solid-button.browser.test.tsx": 0.44,
  "packages/core/src/__tests__/__e2e__/overlay/overlay.browser.test.tsx": 3.87,
  "packages/core/src/__tests__/__e2e__/pagination/pagination.browser.test.tsx": 1.63,
  "packages/core/src/__tests__/__e2e__/panel/panel.browser.test.tsx": 0.17,
  "packages/core/src/__tests__/__e2e__/parent-child-layout/parent-child-layout.browser.test.tsx": 0.57,
  "packages/core/src/__tests__/__e2e__/pill/pill-group.browser.test.tsx": 1.94,
  "packages/core/src/__tests__/__e2e__/pill/pill.browser.test.tsx": 0.55,
  "packages/core/src/__tests__/__e2e__/progress/circular-progress.browser.test.tsx": 0.13,
  "packages/core/src/__tests__/__e2e__/progress/linear-progress.browser.test.tsx": 0.18,
  "packages/core/src/__tests__/__e2e__/radio-button/radio-button-group.browser.test.tsx": 1.21,
  "packages/core/src/__tests__/__e2e__/radio-button/radio-button.browser.test.tsx": 1.03,
  "packages/core/src/__tests__/__e2e__/rating/rating.browser.test.tsx": 2.36,
  "packages/core/src/__tests__/__e2e__/salt-provider/salt-provider.browser.test.tsx": 0.45,
  "packages/core/src/__tests__/__e2e__/scrim/scrim.browser.test.tsx": 0.31,
  "packages/core/src/__tests__/__e2e__/segmented-button-group/segmented-button-group.browser.test.tsx": 0.06,
  "packages/core/src/__tests__/__e2e__/semantic-icon-provider/semantic-icon-provider.browser.test.tsx": 0.13,
  "packages/core/src/__tests__/__e2e__/side-panel/side-panel.browser.test.tsx": 8.74,
  "packages/core/src/__tests__/__e2e__/skip-link/skip-link.browser.test.tsx": 1.09,
  "packages/core/src/__tests__/__e2e__/slider/range-slider.browser.test.tsx": 2.05,
  "packages/core/src/__tests__/__e2e__/slider/slider.browser.test.tsx": 2.65,
  "packages/core/src/__tests__/__e2e__/spinner/spinner-accessibility.browser.test.tsx": 0.12,
  "packages/core/src/__tests__/__e2e__/spinner/spinner.browser.test.tsx": 0.16,
  "packages/core/src/__tests__/__e2e__/split-layout/split-layout.browser.test.tsx": 0.6,
  "packages/core/src/__tests__/__e2e__/stack-layout/stack-layout.browser.test.tsx": 0.38,
  "packages/core/src/__tests__/__e2e__/status-indicator/status-indicator.browser.test.tsx": 0.41,
  "packages/core/src/__tests__/__e2e__/stepper/stepper.browser.test.tsx": 1.31,
  "packages/core/src/__tests__/__e2e__/switch/switch.browser.test.tsx": 1.63,
  "packages/core/src/__tests__/__e2e__/table/table.browser.test.tsx": 2.32,
  "packages/core/src/__tests__/__e2e__/tabs/tabs.browser.test.tsx": 17.06,
  "packages/core/src/__tests__/__e2e__/text/text.browser.test.tsx": 7.19,
  "packages/core/src/__tests__/__e2e__/toast/toast.browser.test.tsx": 0.86,
  "packages/core/src/__tests__/__e2e__/toggle-button-group/toggle-button-group.browser.test.tsx": 2.63,
  "packages/core/src/__tests__/__e2e__/toggle-button/toggle-button.browser.test.tsx": 0.65,
  "packages/core/src/__tests__/__e2e__/toggletip/toggletip.browser.test.tsx": 2.2,
  "packages/core/src/__tests__/__e2e__/toolbar/toolbar.browser.test.tsx": 11.26,
  "packages/core/src/__tests__/__e2e__/tooltip/tooltip.browser.test.tsx": 2.62,
  "packages/core/src/__tests__/__e2e__/tree/tree.browser.test.tsx": 6.21,
  "packages/core/src/__tests__/__e2e__/utils/render-props.browser.test.tsx": 0.15,
  "packages/core/src/__tests__/__e2e__/utils/use-floating-ui.browser.test.tsx": 0.18,
  "packages/core/src/__tests__/__e2e__/utils/use-fork-ref.browser.test.tsx": 0.06,
  "packages/core/src/__tests__/__e2e__/vertical-navigation/vertical-navigation.browser.test.tsx": 0.95,
  "packages/core/src/__tests__/__e2e__/viewport-provider/viewport-provider.browser.test.tsx": 0.2,
  "packages/countries/src/__tests__/__e2e__/country-symbol.browser.test.tsx": 0.93,
  "packages/countries/src/__tests__/__e2e__/lazy-country-symbol.browser.test.tsx": 0.17,
  "packages/date-components/src/__tests__/__e2e__/calendar/calendar-a11y.browser.test.tsx": 37.77,
  "packages/date-components/src/__tests__/__e2e__/calendar/calendar-date-fns-tz.browser.test.tsx": 17.9,
  "packages/date-components/src/__tests__/__e2e__/calendar/calendar-dayjs.browser.test.tsx": 16.93,
  "packages/date-components/src/__tests__/__e2e__/calendar/calendar-luxon.browser.test.tsx": 8.69,
  "packages/date-components/src/__tests__/__e2e__/calendar/calendar-moment.browser.test.tsx": 6.18,
  "packages/date-components/src/__tests__/__e2e__/calendar/calendar-offset.browser.test.tsx": 18.66,
  "packages/date-components/src/__tests__/__e2e__/calendar/calendar-range-date-fns-tz.browser.test.tsx": 26.32,
  "packages/date-components/src/__tests__/__e2e__/calendar/calendar-range-dayjs.browser.test.tsx": 23.48,
  "packages/date-components/src/__tests__/__e2e__/calendar/calendar-range-luxon.browser.test.tsx": 12.11,
  "packages/date-components/src/__tests__/__e2e__/calendar/calendar-range-moment.browser.test.tsx": 8.74,
  "packages/date-components/src/__tests__/__e2e__/calendar/calendar-single-date-fns-tz.browser.test.tsx": 20.71,
  "packages/date-components/src/__tests__/__e2e__/calendar/calendar-single-dayjs.browser.test.tsx": 20.99,
  "packages/date-components/src/__tests__/__e2e__/calendar/calendar-single-luxon.browser.test.tsx": 9.62,
  "packages/date-components/src/__tests__/__e2e__/calendar/calendar-single-moment.browser.test.tsx": 9.52,
  "packages/date-components/src/__tests__/__e2e__/date-input/date-input-range.browser.test.tsx": 23.19,
  "packages/date-components/src/__tests__/__e2e__/date-input/date-input-single.browser.test.tsx": 16.79,
  "packages/date-components/src/__tests__/__e2e__/date-input/date-input.browser.test.tsx": 2.93,
  "packages/date-components/src/__tests__/__e2e__/date-picker/date-picker-a11y.browser.test.tsx": 8.31,
  "packages/date-components/src/__tests__/__e2e__/date-picker/date-picker-range-date-fns-tz.browser.test.tsx": 34.53,
  "packages/date-components/src/__tests__/__e2e__/date-picker/date-picker-range-dayjs.browser.test.tsx": 34.51,
  "packages/date-components/src/__tests__/__e2e__/date-picker/date-picker-range-luxon.browser.test.tsx": 23.7,
  "packages/date-components/src/__tests__/__e2e__/date-picker/date-picker-range-moment.browser.test.tsx": 21.66,
  "packages/date-components/src/__tests__/__e2e__/date-picker/date-picker-single-date-fns-tz.browser.test.tsx": 20.34,
  "packages/date-components/src/__tests__/__e2e__/date-picker/date-picker-single-dayjs.browser.test.tsx": 23.09,
  "packages/date-components/src/__tests__/__e2e__/date-picker/date-picker-single-luxon.browser.test.tsx": 13.93,
  "packages/date-components/src/__tests__/__e2e__/date-picker/date-picker-single-moment.browser.test.tsx": 11.53,
  "packages/embla-carousel/src/__tests__/__e2e__/carousel-accessibility.browser.test.tsx": 1,
  "packages/embla-carousel/src/__tests__/__e2e__/carousel.browser.test.tsx": 6.51,
  "packages/icons/src/__tests__/__e2e__/icon.browser.test.tsx": 3.75,
  "packages/lab/src/__tests__/__e2e__/avatar-group/avatar-group.browser.test.tsx": 0.58,
  "packages/lab/src/__tests__/__e2e__/cascading-menu/cascading-menu.browser.test.tsx": 1.59,
  "packages/lab/src/__tests__/__e2e__/color-chooser/color-chooser.browser.test.tsx": 0.96,
  "packages/lab/src/__tests__/__e2e__/color-chooser/swatches-picker.browser.test.tsx": 0.47,
  "packages/lab/src/__tests__/__e2e__/combo-box-deprecated/combo-box-deprecated-accessibility.browser.test.tsx": 3.24,
  "packages/lab/src/__tests__/__e2e__/combo-box-deprecated/combo-box-deprecated-keyboard-navigation.browser.test.tsx": 10.41,
  "packages/lab/src/__tests__/__e2e__/combo-box-deprecated/combo-box-deprecated-selection.browser.test.tsx": 5.68,
  "packages/lab/src/__tests__/__e2e__/combo-box-deprecated/combo-box-deprecated.browser.test.tsx": 2.82,
  "packages/lab/src/__tests__/__e2e__/combo-box/combo-box-lab-accessibility.browser.test.tsx": 0.84,
  "packages/lab/src/__tests__/__e2e__/combo-box/combo-box-lab-keyboard-navigation.browser.test.tsx": 2.3,
  "packages/lab/src/__tests__/__e2e__/combo-box/combo-box-lab-selection.browser.test.tsx": 2.96,
  "packages/lab/src/__tests__/__e2e__/combo-box/combo-box-lab.browser.test.tsx": 1.73,
  "packages/lab/src/__tests__/__e2e__/contact-details/contact-details-accessibility.browser.test.tsx": 1.41,
  "packages/lab/src/__tests__/__e2e__/contact-details/contact-details.browser.test.tsx": 2.6,
  "packages/lab/src/__tests__/__e2e__/content-status/content-status.browser.test.tsx": 0.66,
  "packages/lab/src/__tests__/__e2e__/deck-layout/deck-layout.browser.test.tsx": 1,
  "packages/lab/src/__tests__/__e2e__/dropdown/dropdown-button.browser.test.tsx": 0.1,
  "packages/lab/src/__tests__/__e2e__/dropdown/dropdown-keyboard-navigation.browser.test.tsx": 3.22,
  "packages/lab/src/__tests__/__e2e__/dropdown/dropdown-performance.browser.test.tsx": 2.21,
  "packages/lab/src/__tests__/__e2e__/dropdown/dropdown.browser.test.tsx": 0.42,
  "packages/lab/src/__tests__/__e2e__/form-field-legacy/form-field-legacy.browser.test.tsx": 0.54,
  "packages/lab/src/__tests__/__e2e__/form-field-legacy/form-label.browser.test.tsx": 0.35,
  "packages/lab/src/__tests__/__e2e__/formatted-input/formatted-input.browser.test.tsx": 0.7,
  "packages/lab/src/__tests__/__e2e__/input-legacy/input-legacy.browser.test.tsx": 1.13,
  "packages/lab/src/__tests__/__e2e__/layer-layout/layer-layout.browser.test.tsx": 2.56,
  "packages/lab/src/__tests__/__e2e__/list-next/list-next.browser.test.tsx": 1.39,
  "packages/lab/src/__tests__/__e2e__/list/highlighter.browser.test.tsx": 0.18,
  "packages/lab/src/__tests__/__e2e__/list/list-accessibility.browser.test.tsx": 0.98,
  "packages/lab/src/__tests__/__e2e__/list/list-declarative.browser.test.tsx": 0.56,
  "packages/lab/src/__tests__/__e2e__/list/list-keyboard-navigation.browser.test.tsx": 4.06,
  "packages/lab/src/__tests__/__e2e__/list/list-scroll-api.browser.test.tsx": 0.33,
  "packages/lab/src/__tests__/__e2e__/list/list-selection.browser.test.tsx": 11.89,
  "packages/lab/src/__tests__/__e2e__/list/list.browser.test.tsx": 0.41,
  "packages/lab/src/__tests__/__e2e__/logo/logo.browser.test.tsx": 0.12,
  "packages/lab/src/__tests__/__e2e__/metric/metric.browser.test.tsx": 0.63,
  "packages/lab/src/__tests__/__e2e__/query-input/query-input.browser.test.tsx": 1.34,
  "packages/lab/src/__tests__/__e2e__/search-input/search-input.browser.test.tsx": 2.71,
  "packages/lab/src/__tests__/__e2e__/system-status/system-status.browser.test.tsx": 0.77,
  "packages/lab/src/__tests__/__e2e__/toast-group/toast-group.browser.test.tsx": 0.23,
  "packages/lab/src/__tests__/__e2e__/tokenized-input-next/tokenized-input-next.browser.test.tsx": 3.33,
  "packages/styles/src/__tests__/__e2e__/csp-provider/csp-provider.browser.test.tsx": 0.05,
  "packages/styles/src/__tests__/__e2e__/use-class-name-injection.browser.test.tsx": 0.23,
  "packages/styles/src/__tests__/__e2e__/use-style-inject.browser.test.tsx": 0.95,
  "packages/window/src/__tests__/__e2e__/window-provider/window-provider.browser.test.tsx": 0.23,
  "test/browser/integration.browser.test.tsx": 0.73,
  "test/browser/render.browser.test.tsx": 0.19
};

export default class CiDurationSequencer extends BaseSequencer {
  private getFilePath(file: TestSpecification): string {
    return path
      .relative(this.ctx.config.root, path.resolve(this.ctx.config.root, file.moduleId))
      .replaceAll("\\", "/");
  }

  private getEstimate(file: TestSpecification): number {
    return estimatedSecondsByFile[this.getFilePath(file)] ?? 5;
  }

  private byDuration(a: TestSpecification, b: TestSpecification): number {
    return (
      this.getEstimate(b) - this.getEstimate(a) ||
      this.getFilePath(a).localeCompare(this.getFilePath(b))
    );
  }

  override async shard(files: TestSpecification[]): Promise<TestSpecification[]> {
    const shard = this.ctx.config.shard;
    if (!shard) return super.shard(files);

    const groups = Array.from({ length: shard.count }, () => ({
      seconds: 0,
      files: [] as TestSpecification[],
    }));

    // Longest-processing-time-first greedy assignment; deterministic for a
    // fixed file set and independent of the current shard index.
    for (const file of [...files].sort((a, b) => this.byDuration(a, b))) {
      let target = 0;
      for (let i = 1; i < groups.length; i++) {
        if (groups[i].seconds < groups[target].seconds) target = i;
      }
      groups[target].files.push(file);
      groups[target].seconds += this.getEstimate(file);
    }

    const selected = groups[shard.index - 1];
    console.log(
      `CI duration shard ${shard.index}/${shard.count}: ${selected.files.length}/${files.length} files; estimated loads: ${groups.map((g) => Math.round(g.seconds)).join(", ")}s`,
    );
    return selected.files;
  }

  override async sort(files: TestSpecification[]): Promise<TestSpecification[]> {
    // Start historically expensive files first so they don't become the tail.
    return [...files].sort((a, b) => this.byDuration(a, b));
  }
}
