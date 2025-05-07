---
"@salt-ds/react-resizable-panels-theme": major
---

Created the `@salt-ds/react-resizable-panels-theme` package.

To install the `@salt-ds/react-resizable-panels-theme` package, run the command appropriate to your environment: `yarn add @salt-ds/react-resizable-panels-theme` or `npm install @salt-ds/react-resizable-panels-theme`

To import the Salt React Resizable Panels theme, use:

```js
import "@salt-ds/react-resizable-panels-theme/index.css";
```

Then wrap your React Resizable Panel Group with the `react-resizable-panels-theme-salt` class name:

```js
<div className="react-resizable-panels-theme-salt">
  <PanelGroup direction="horizontal">
    <Panel id="left">
      <Text>Left</Text>
    </Panel>
    <PanelResizeHandle />
    <Panel id="middle">
      <Text>Center</Text>
    </Panel>
    <PanelResizeHandle />
    <Panel id="right">
      <Text>Right</Text>
    </Panel>
  </PanelGroup>
</div>
```
