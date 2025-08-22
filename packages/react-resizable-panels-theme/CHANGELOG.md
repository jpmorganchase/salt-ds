# @salt-ds/react-resizable-panels-theme

## 1.0.3

### Patch Changes

- Updated dependencies [9277313]
- Updated dependencies [512b0e7]
- Updated dependencies [64ef723]
- Updated dependencies [9277313]
- Updated dependencies [9277313]
- Updated dependencies [9277313]
- Updated dependencies [8538730]
- Updated dependencies [9277313]
  - @salt-ds/theme@1.32.0

## 1.0.2

### Patch Changes

- Updated dependencies [665c306]
- Updated dependencies [9a4ff31]
- Updated dependencies [5edb00f]
- Updated dependencies [c86ee15]
- Updated dependencies [1a8898f]
- Updated dependencies [5edb00f]
- Updated dependencies [1a8898f]
- Updated dependencies [9a4ff31]
- Updated dependencies [1a8898f]
- Updated dependencies [91f0e09]
- Updated dependencies [efb4fbc]
- Updated dependencies [efb4fbc]
  - @salt-ds/theme@1.31.0

## 1.0.1

### Patch Changes

- 621253b: Refactored components and themes to use the new fixed tokens.
- Updated dependencies [621253b]
- Updated dependencies [621253b]
- Updated dependencies [621253b]
- Updated dependencies [2d58071]
- Updated dependencies [7adcf27]
  - @salt-ds/theme@1.30.0

## 1.0.0

### Major Changes

- 4a240fd: Created the `@salt-ds/react-resizable-panels-theme` package.

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
