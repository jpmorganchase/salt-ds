---
"@salt-ds/highcharts-theme": patch
---

Styled the reset zoom button to (imperfectly) match Salt Button solid neutral appearance, including hover and focus states.

Salt defaults now set `chart.zooming.resetButton.theme` and `accessibility.keyboardNavigation.focusBorder`. When Highcharts accessibility is loaded, `useChart` also applies the reset button hover state while its accessibility proxy has keyboard focus.
