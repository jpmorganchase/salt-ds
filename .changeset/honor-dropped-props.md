---
"@salt-ds/core": patch
"@salt-ds/date-components": patch
"@salt-ds/embla-carousel": patch
---

Fixed props that components dropped, replaced with their own, or put on the wrong element.

- `Tooltip` applies HTML attributes, such as `id`, `className`, `style`, `aria-label` and `data-*` attributes, to the tooltip. A custom `id` is also used for the trigger's `aria-describedby`.
- `NumberInput` applies `id` to its input. It calls `inputProps.onChange` as well as its own change handler, and calls `inputProps.onKeyDown` when it's read-only.
- `Input`, `MultilineInput` and `ComboBox` keep their own class on the input when `inputProps.className` or `textAreaProps.className` is set.
- `ComboBox` calls `inputProps.onKeyDown` and the `OverlayProps` event handlers as well as its own handlers, and shows `emptyReadOnlyMarker` when it's read-only with nothing selected.
- `ListBox` calls `onFocus`, `onMouseDown` and `onMouseOver` as well as its own handlers, and `Option` calls `onMouseOver`.
- `Dialog`, `Drawer` and `MenuPanel` combine your event handlers with their own, so passing one such as `onKeyDown` no longer breaks Escape or arrow key handling. `Dialog` also calls `onAnimationEnd`.
- `OverlayPanelContent` calls `onScrollCapture` and still updates its scroll dividers.
- `FormFieldLabel` and `FormFieldHelperText` forward their refs, so `DatePickerHelperText`'s ref also works. `FormFieldHelperText`'s props and ref are now typed for the `div` it renders. Inside a `FormField`, their `id` is always the one the form field generates, so the control stays labelled. Set `id` on the `FormField` to change it.
- Components with a `render` prop keep the ref of the `render` element as well as their own, and `CollapsibleTrigger` keeps its child's ref.
- `GoToInput`'s `inputRef` and `CompactInput`'s ref are set to the input element rather than its wrapper.
- `Accordion` applies `id` to its root element.
- `DatePickerSingleInput` and `DatePickerRangeInput` call `onDateChange` as well as their own handler, so the picker's selection still updates.
- `CalendarDay` calls the `onClick`, `onKeyDown`, `onFocus` and `onMouseMove` passed in `CalendarDayProps` as well as its own handlers.
- `CarouselNextButton` and `CarouselPreviousButton` apply `className`, and their `aria-controls` refers to the `id` passed to `CarouselSlides`.
- `CarouselProgressLabel` applies `styleAs` and forwards its ref, and no longer accepts `children`, which it replaced with its own text.
- `CarouselSlides` calls `onMouseDown` and `onMouseUp` as well as its own handlers, and keeps the refs of its slides.
- `Carousel` applies `id` to its root element.
- `CarouselAutoplayIndicator` merges `style` with its own styles, and no longer accepts `children`, which it didn't render.
