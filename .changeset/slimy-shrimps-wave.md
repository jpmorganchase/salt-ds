---
"@salt-ds/highcharts-theme": patch
---

Styled the reset zoom button to (imperfectly) match Salt Button solid neutral appearance, including hover & focus states.

Salt defaults now set `chart.zooming.resetButton.theme` and adjust `accessibility.keyboardNavigation.order` so the zoom proxy sits before the chart SVG, enabling focus styling without event hooks.
