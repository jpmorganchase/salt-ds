---
"@salt-ds/highcharts-theme": patch
---

Fixed `useChart` so charts rendered before web fonts finish loading re-measure their text once the fonts are ready. Highcharts caches text bounding boxes without accounting for font family, so labels measured against a fallback font (e.g. pie and donut data labels and their connectors) previously stayed mispositioned until the chart was remounted. Charts now re-layout once `document.fonts.ready` resolves, making first-load rendering consistent with subsequent renders.
