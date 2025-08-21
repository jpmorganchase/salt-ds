---
"@salt-ds/highcharts-theme": minor
---

- Added PieChart
- Since DonutChart is a variant of PieChart,the plotOptions.pie.innerSize setting is moved out of the global options; otherwise, a default PieChart would automatically become a DonutChart
- Consumers are instructed to supply the innerSize setting themselves in documentation.
- Documentation reordered to show PieChart first due to the above.
