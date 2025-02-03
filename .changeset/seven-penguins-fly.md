---
"@salt-ds/lab": minor
---

# Introducing the Splitter component

`Splitter` divides window content into separate regions called `Splits` that can be dragged and resized, allowing users to customize the layout of their workspace.

The Salt Splitter leverages the popular open-source library react-resizable-panels, making adjustments to component names, adding custom styling, and introducing extra functionality to better align with the rest of the components present in our design system.

## Remapping

| salt-ds                      | react-resizable-panels       |
| ---------------------------- | ---------------------------- |
| <Splitter />                 | <PanelGroup />               |
| <Split />                    | <Panel />                    |
| <SplitHandle />              | <PanelResizeHandle />        |
| SplitterProps["orientation"] | PanelGroupProps["direction"] |

## Added Functionality

`SplitterProps["appearance"]` - This prop allows you to change the appearance of the Splitter component. The appearance prop here acts similarly to `Button["appearance"]`. It can take one of two options `bordered` (default) and `transparent`. The bordered options will add a border each nested `<SplitHandle />`, while the transparent option will leak through the background color of the parent component.
