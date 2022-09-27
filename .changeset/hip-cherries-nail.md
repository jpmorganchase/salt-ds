---
"@jpmorganchase/uitk-ag-grid-theme": patch
"@jpmorganchase/uitk-core": patch
"@jpmorganchase/uitk-lab": patch
---

Remove import directly from `src` so consumers won't encounter
TS error if `skipLibCheck` is set to false. 
