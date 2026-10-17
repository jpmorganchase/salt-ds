---
"@salt-ds/highcharts-theme": patch
---

Spacing, size and text tokens defined in rem, such as those in `@salt-ds/theme/css/experimental/rem-units.css`, are now converted to px before they're passed to Highcharts. Previously, a rem value such as `0.5rem` was read as 0.5px.
