---
"@salt-ds/lab": minor
---

Refactor ToggleButton to use a new API to simplify its usage.

```diff
- <ToggleButtonGroup onChange={handleChange} selectedIndex={selectedIndex}>
-  <ToggleButton aria-label="alert" tooltipText="Alert">
-    <NotificationIcon /> Alert
-  </ToggleButton>
-  <ToggleButton aria-label="home" tooltipText="Home">
-    <HomeIcon /> Home
-  </ToggleButton>
-  <ToggleButton aria-label="search" tooltipText="Search">
-    <SearchIcon /> Search
-  </ToggleButton>
-  <ToggleButton aria-label="print" tooltipText="Print">
-    <PrintIcon /> Print
-  </ToggleButton>
-</ToggleButtonGroup>
+<ToggleButtonGroup onSelectionChange={handleChange} selected={selected}>
+  <ToggleButton value="alert">
+    <NotificationIcon aria-hidden /> Alert
+  </ToggleButton>
+  <ToggleButton value="home">
+    <HomeIcon aria-hidden /> Home
+  </ToggleButton>
+  <ToggleButton value="search">
+    <SearchIcon aria-hidden /> Search
+  </ToggleButton>
+  <ToggleButton value="print">
+    <PrintIcon aria-hidden /> Print
+  </ToggleButton>
+</ToggleButtonGroup>
``

```
